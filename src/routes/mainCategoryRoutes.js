// routes/mainCategory.js
import express from 'express';
import { getAlbumData, getPersonImages } from '../controllers/mainCategoryController.js';
import multer from 'multer';

const mainCategoryRoutes = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Route to create an event
mainCategoryRoutes.get('/',  getAlbumData);
mainCategoryRoutes.post('/person', upload.single('file'), getPersonImages)
export default mainCategoryRoutes;
