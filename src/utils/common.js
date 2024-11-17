import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Storage } from '@google-cloud/storage';
import axios from 'axios';

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
  const storageConfig = process.env.KEY_FILE_NAME
    ? { keyFilename: process.env.KEY_FILE_NAME }
    : {}; // Use default credentials on Cloud Run

  const storage = new Storage(storageConfig);
  const bucketName = process.env.BUCKET_NAME;
  const bucket = storage.bucket(bucketName);
  return bucket;
};

export const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

/**
 * Makes an HTTP request using Axios.
 *
 * @param {string} endpoint - The endpoint or full URL for the request.
 * @param {string} method - The HTTP method (GET, POST, PUT, DELETE, PATCH).
 * @param {object} [data={}] - The request payload for methods like POST or PUT.
 * @param {object} [headers={}] - Additional request headers.
 * @param {string} [baseUrl=''] - The base URL for relative endpoints.
 * @returns {Promise<any>} - The response data from the server.
 */
export const httpRequest = async (endpoint, method, data = {}, headers = {}, baseUrl = '') => {
  const validMethods = ['get', 'post', 'put', 'delete', 'patch'];
  const httpMethod = method.toLowerCase();

  if (!validMethods.includes(httpMethod)) {
    throw new Error(`Invalid HTTP method: ${method}`);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  const config = {
    method: httpMethod,
    url,
    headers: defaultHeaders,
    ...(httpMethod === 'post' || httpMethod === 'put' || httpMethod === 'patch' || httpMethod === 'delete'
      ? { data }
      : {}),
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('Error in HTTP request:', {
      url,
      method: httpMethod,
      data,
      error: error.response?.data || error.message,
    });
    throw error;
  }
};