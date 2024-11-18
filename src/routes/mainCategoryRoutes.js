// routes/mainCategory.js
import express from 'express';
import { getAlbumData } from '../controllers/mainCategoryController.js';

const mainCategoryRoutes = express.Router();

// Route to create an event
mainCategoryRoutes.get('/',  getAlbumData);

export default mainCategoryRoutes;
