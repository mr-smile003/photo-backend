import Clusters from '../models/clusters.js';
import photo from '../models/photo.js';
import { chunkArray, httpRequest } from '../utils/common.js';

export const getFaceEncodings = async (photoLink) => {
    return httpRequest(`${process.env.AI_SERVICE_URL}/face_encodings/`, 'post', { image_url: photoLink });
}

const matchFace = (encoding, targetedEncodings) => {
    const encodings = targetedEncodings.map(en => ({ personId: en._id+"", encodings: en.encoding }))
    return httpRequest(`${process.env.AI_SERVICE_URL}/face_match/`, 'post', { encoding, targetedEncodings: encodings });
}


const extractFaceEncodings = async (photoDataArray) => {
    try {
        // Chunk the photoDataArray into chunks of 100
        const chunks = chunkArray(photoDataArray, 100);

        const photoWithEncodings = [];

        // Process each chunk sequentially
        for (const chunk of chunks) {
            // Fetch encodings and associate them with their respective photo details
            const encodings = await Promise.all(
                chunk.map(async (photo) => {
                    const encoding = await getFaceEncodings(photo.url);
                    return {
                        ...photo, // Spread photo details
                        encodings: encoding?.encodings, // Add encodings to the photo object
                    };
                })
            );

            photoWithEncodings.push(...encodings);
        }
        
        return photoWithEncodings;
    } catch (error) {
        console.error('Error extracting face encodings:', error);
        throw error;
    }
}

export const defineClusters = async (photoDataArray, eventId) => {
    try {
        // Extract encodings from photo data
        const photoWithEncodings = await extractFaceEncodings(photoDataArray);

        // Fetch all existing encodings for the event once
        const existingEncodings = await Clusters.find({ eventId }, { encoding: 1 }).lean();

        for (const photoWithEncoding of photoWithEncodings) {
            const encodings = photoWithEncoding?.encodings;

            for (let i=0; i< encodings?.length; i++) {
                // Check if a matching face exists
                let isMatchFound = existingEncodings?.length > 0 ? await matchFace(encodings[i], existingEncodings) : null;
                
                if(isMatchFound?.personId){
                    await photo.updateOne(
                        { _id: photoWithEncoding?._id },
                        { $push: { clusterIds: isMatchFound?.personId }}
                    )
                    isMatchFound = null
                }
                else {
                    const newCluster = await Clusters.create({ eventId, encoding: encodings[i]  });
                    existingEncodings.push({ eventId: eventId, encoding: encodings[i], _id: newCluster._id }); // Update in-memory list to avoid duplicate processing
                }
            }
        }
    } catch (error) {
        console.error('Error defining clusters:', error);
        throw error;
    }
};


export const matchSelfie = async (url, eventId) => {
    const encoding = await getFaceEncodings(url);
    const existingEncodings = await Clusters.find({ eventId }, { encoding: 1 }).lean();
    const matched =  await matchFace(encoding?.encodings[0], existingEncodings);
    if(matched?.personId){
        const allPhotos = await photo.find({ clusterIds: matched?.personId }).lean();
        return allPhotos
    }
    return null
}
