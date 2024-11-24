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
            // Process each photo one by one
            for (const photo of chunk) {
                const encoding = await getFaceEncodings(photo.url);
                photoWithEncodings.push({
                    ...photo,
                    encodings: encoding?.encodings,
                });
            }
        }
        
        return photoWithEncodings;
    } catch (error) {
        console.error('Error extracting face encodings:', error);
        throw error;
    }
}

export const defineClusters = async (photoDataArray, eventId) => {
    try {
        for(const photoData of photoDataArray){
            const faceEncode = await getFaceEncodings(photoData.url);
            const encodings = faceEncode.encodings

        if (encodings?.length) {
            // Fetch all existing encodings for the event
            const existingEncodings = await Clusters.find({ eventId }, { encoding: 1 }).lean();

            // Step 2: Process each encoding
            for (const encoding of encodings) {
                let cluster;

                // Match the encoding to existing clusters
                const match = existingEncodings.length
                    ? await matchFace(encoding, existingEncodings)
                    : null;

                if (match?.personId) {
                    // Match found; assign to the existing cluster
                    cluster = match.personId;
                } else {
                    // No match found; create a new cluster
                    const newCluster = await Clusters.create({ eventId, encoding });
                    cluster = newCluster._id;

                    // Update in-memory encodings
                    existingEncodings.push({ eventId, encoding, _id: cluster });
                }

                // Step 3: Update the photo with the cluster ID
                await photo.updateOne(
                    { _id: photoData._id },
                    { $push: { clusterIds: cluster } }
                );
            }
        }

        // Mark photo as processed
        await photo.updateOne(
            { _id: photoData._id },
            { $set: { face_detection: true } }
        );

        }
    } catch (error) {
        console.error('Error defining clusters:', error);
        throw error;
    }
};


export const matchSelfie = async (url, eventId) => {
    try {
        const encoding = await getFaceEncodings(url);
        if (!encoding?.encodings?.length) {
            throw new Error('No face detected.');
        }

        const chunkSize = 50;
        let skip = 0;

        while (true) {
            // Fetch a batch of clusters
            const batch = await Clusters.find(
                { eventId },
                { encoding: 1, personId: 1 }
            )
                .skip(skip)
                .limit(chunkSize)
                .lean();

            if (!batch.length) break; // Exit loop if no more data

            // Match face in the current batch
            const matched = await matchFace(encoding?.encodings?.[0], batch);
            if (matched?.personId) {
                return matched.personId;
            }

            // Move to the next batch
            skip += chunkSize;
        }

        return null; // Return null if no match found
    } catch (error) {
        console.error('Error in matchSelfie:', error);
        throw new Error(error?.message);
    }
};
