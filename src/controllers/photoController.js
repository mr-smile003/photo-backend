import { Storage } from '@google-cloud/storage';
import Photo from '../models/photo.js';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { getGCPBucket } from '../utils/common.js';
import { defineClusters, matchSelfie } from '../services/faceDetectionService.js';
import mongoose from 'mongoose';
import Event from '../models/events.js';


export const uploadMultiplePhotos = async (req, res) => {
  const bucket = getGCPBucket()
  try {
    const photos = req.files;
    const eventId = req.body.eventId;
    const folderId = req.body.folderId;

    if (!photos || photos.length === 0) {
      return res.status(400).json({ message: 'No photos uploaded' });
    }
    if (!eventId || !folderId) {
      return res.status(400).json({ message: 'eventId and folderId are required' });
    }

    const uploadPromises = photos.map(async (file) => {
      const gcsFilename = `${eventId}/${uuidv4()}_${file.originalname}`;
      const blob = bucket.file(gcsFilename);

      // Compress the image using Sharp
      const compressedBuffer = await sharp(file.buffer)
        .rotate()
        .jpeg({ quality: 30 })        // Compress to JPEG with 80% quality
        .toBuffer();

      const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: 'image/jpeg',    // Set MIME type based on compression output
      });

      return new Promise((resolve, reject) => {
        blobStream.on('error', (err) => reject(err));
        blobStream.on('finish', async () => {

          // Prepare photo data for DB insertion
          const photoData = {
            filename: gcsFilename,
            eventId: eventId,
            folderId: folderId,
            url: `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${gcsFilename}`,
          };
          resolve(photoData);
        });

        // Upload the compressed buffer
        blobStream.end(compressedBuffer);
      });
    });
    const photoDataArray = await Promise.all(uploadPromises);
    const allData = await Photo.insertMany(photoDataArray)
    const leanData = allData.map(doc => doc.toObject());
    defineClusters(leanData, eventId);

    res.status(200).json({ message: 'Photos uploaded successfully!', photos: photoDataArray });
  } catch (err) {
    console.error('Error during upload:', err);
    res.status(500).json({ message: 'Error uploading photos' });
  }
};

// Get photos by event ID
export const getPhotosByEventId = async (req, res) => {
  try {
    let { eventNumber, skip = 0, limit = 20, folderId, matchPersonId } = req.query;
    if (!eventNumber) return res.status(404).json({ message: 'eventNumber and folderId required.' });
    const eventId = await Event.findOne({ eventNumber: eventNumber }, { _id: 1 });
    if(limit > 100) limit = 50;
    const criteria = { eventId }
    if(folderId){
      criteria.folderId = folderId
    }
    if(matchPersonId){
      criteria.clusterIds = matchPersonId
    }
    const totalPhotos = await Photo.countDocuments(criteria); // Get total count
    const photos = await Photo.find(criteria).lean().skip(parseInt(skip)).limit(parseInt(limit));
    
    return res.status(200).json({
      data: photos,
      totalCount: totalPhotos, // Include total count in response
      message: 'Photos retrieved successfully!'
    });
  } catch (err) {
    console.error('Error fetching photos:', err);
    return res.status(500).json({ message: 'Error fetching photos' });
  }
};

// Get photo by ID (directly from GCS)
export const getPhotoById = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id).lean();
    if (!photo) {
      return res.status(400).json({ message: 'Photo not found' });
    }

    res.redirect(photo.url); // Redirect to the GCS public URL
  } catch (err) {
    console.error('Error fetching photo:', err);
    return res.status(500).json({ message: 'Error fetching photo' });
  }
};

export const uploadPhoto = async (req, res) => {
  const bucket = getGCPBucket()
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No photo uploaded' });
    }

    const gcsFilename = `${uuidv4()}_${file.originalname}`;
    const blob = bucket.file(gcsFilename);

    // Compress the image using Sharp
    const compressedBuffer = await sharp(file.buffer)
      .jpeg({ quality: 30 }) // Compress to JPEG with 30% quality
      .toBuffer();

    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: 'image/jpeg',
    });

    blobStream.on('error', (err) => {
      console.error('Upload error:', err);
      return res.status(500).json({ message: 'Error uploading photo' });
    });

    blobStream.on('finish', () => {
      const photoUrl = `https://storage.googleapis.com/${bucket.name}/${gcsFilename}`;
      return res.status(200).json({ message: 'Photo uploaded successfully!', photoUrl });
    });

    // Upload the compressed buffer
    blobStream.end(compressedBuffer);

  } catch (err) {
    console.error('Error during upload:', err);
    return res.status(500).json({ message: 'Error uploading photo' });
  }
};
export const getSelfiePhotos = async (req, res) => {
  const bucket = getGCPBucket()
  try {

    const { eventNumber } = req.body;
    const eventId = await Event.findOne({ eventNumber: eventNumber }, { _id: 1 }).lean();
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No photo uploaded' });
    }

    const gcsFilename = `${uuidv4()}_${file.originalname}`;
    const blob = bucket.file(gcsFilename);

    // Compress the image using Sharp
    const compressedBuffer = await sharp(file.buffer)
      .flop()
      .jpeg({ quality: 30 }) // Compress to JPEG with 30% quality
      .toBuffer();

    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: 'image/jpeg',
    });

    blobStream.on('error', (err) => {
      console.error('Upload error:', err);
      return res.status(500).json({ message: 'Error uploading photo' });
    });

    blobStream.on('finish', async() => {
      const photoUrl = `https://storage.googleapis.com/${bucket.name}/${gcsFilename}`;
      const matchPersonId = await matchSelfie(photoUrl, eventId?._id);
      return res.status(200).json({ message: 'Photo uploaded successfully!', matchPersonId });
    }); 

    // Upload the compressed buffer
    blobStream.end(compressedBuffer);

  } catch (err) {
    console.error('Error during upload:', err);
    return res.status(500).json({ message: 'Error uploading photo' });
  }
};


export const getFaceDetectionStatus = async (req, res) => {
  try {
    const { eventId, photoId } = req.query;
    const isDetected = await Photo.findOne({ _id: new mongoose.Types.ObjectId(photoId), eventId: new mongoose.Types.ObjectId(eventId) }, { face_detection: 1 }).lean();
    return res.status(200).json({ isDetected: isDetected?.face_detection });
  } catch (err){
    console.error('Error during upload:', err);
    return res.status(500).json({ message: 'Error getting status' });
  }
}
