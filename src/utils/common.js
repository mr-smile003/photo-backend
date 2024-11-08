import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Storage } from '@google-cloud/storage';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const moveToPhotoGrapherFolder = async (eventId, files) => {
  try {
    // Define the directory path for the photographer
    const photographerDir = path.join(__dirname, '../../public/images', eventId);

    // Check if the directory exists, if not, create it
    if (!fs.existsSync(photographerDir)) {
      await fs.promises.mkdir(photographerDir, { recursive: true });
    }

    const photos = [];
    const fileMovePromises = files.map(file => {
      // Create a file name using the photographer ID and the original extension
      const fileName = `${file.originalname}`;

      if (!fileName) throw new Error('Photographer Id not found');

      photos.push({
        filename: fileName,
      });

      // Define the destination path inside the photographer's folder
      const destinationPath = path.join(photographerDir, fileName);

      // Move the file to the destination folder
      return fs.promises.rename(file.path, destinationPath);
    });

    // Use Promise.allSettled to run all file moves in parallel and wait for all to complete
    const results = await Promise.allSettled(fileMovePromises);

    // Check for any errors
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Error moving file: ${files[index].originalname}`, result.reason);
      }
    });

    return photos;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getGCPBucket = () => {
  const storage = new Storage({
    keyFilename: process.env.KEY_FILE_NAME,
  });
  const bucketName = process.env.BUCKET_NAME;
  const bucket = storage.bucket(bucketName);
  return bucket
}