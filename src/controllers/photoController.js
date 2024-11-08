import { Storage } from '@google-cloud/storage';
import Photo from '../models/photo.js';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { getGCPBucket } from '../utils/common.js';


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
    await Photo.insertMany(photoDataArray);

    res.status(200).json({ message: 'Photos uploaded successfully!', photos: photoDataArray });
  } catch (err) {
    console.error('Error during upload:', err);
    res.status(500).json({ message: 'Error uploading photos' });
  }
};

// Get photos by event ID
export const getPhotosByEventId = async (req, res) => {
  try {
    let { eventId, skip = 0, limit = 20, folderId } = req.query;
    if (!eventId || !folderId) return res.status(404).json({ message: 'eventId and folderId required.' });
    if(limit > 100) limit = 50;

    const totalPhotos = await Photo.countDocuments({ eventId, folderId }); // Get total count
    const photos = await Photo.find({ eventId, folderId }).lean().skip(parseInt(skip)).limit(parseInt(limit));
    
    res.status(200).json({
      data: photos,
      totalCount: totalPhotos, // Include total count in response
      message: 'Photos retrieved successfully!'
    });
  } catch (err) {
    console.error('Error fetching photos:', err);
    res.status(500).json({ message: 'Error fetching photos' });
  }
};

// Get photo by ID (directly from GCS)
export const getPhotoById = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id).lean();
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    res.redirect(photo.url); // Redirect to the GCS public URL
  } catch (err) {
    console.error('Error fetching photo:', err);
    res.status(500).json({ message: 'Error fetching photo' });
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
      res.status(500).json({ message: 'Error uploading photo' });
    });

    blobStream.on('finish', () => {
      const photoUrl = `https://storage.googleapis.com/${bucket.name}/${gcsFilename}`;
      res.status(200).json({ message: 'Photo uploaded successfully!', photoUrl });
    });

    // Upload the compressed buffer
    blobStream.end(compressedBuffer);

  } catch (err) {
    console.error('Error during upload:', err);
    res.status(500).json({ message: 'Error uploading photo' });
  }
};
