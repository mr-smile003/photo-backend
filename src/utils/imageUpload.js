import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { getGCPBucket } from './common.js';

export const uploadAndCompressImage = async (file, quality = 30) => {
  try {
    const bucket = getGCPBucket()
    const gcsFilename = `${uuidv4()}_${file.originalname}`;
    const blob = bucket.file(gcsFilename);

    // Compress the image
    const compressedBuffer = await sharp(file.buffer)
      .jpeg({ quality: quality }) // Compress to JPEG with 30% quality
      .toBuffer();

    // Create a stream for uploading the compressed image to Google Cloud
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: 'image/jpeg',
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (err) => {
        console.error('Upload error:', err);
        reject(new Error('Error uploading photo'));
      });

      blobStream.on('finish', () => {
        const photoUrl = `https://storage.googleapis.com/${bucket.name}/${gcsFilename}`;
        resolve(photoUrl); // Resolve with the photo URL after successful upload
      });

      // Upload the compressed buffer
      blobStream.end(compressedBuffer);
    });
  } catch (error) {
    console.error('Error during image upload:', error);
    throw new Error('Error during image upload');
  }
};
