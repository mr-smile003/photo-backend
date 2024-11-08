// routes/folderRoutes.js
import express from 'express';
import { createFolder, getFolders, deleteFolder, updateFolder } from '../controllers/folderController.js';

const folderRoutes = express.Router();

// Route to create an folder
folderRoutes.post('/create', createFolder);
folderRoutes.put('/update', updateFolder);

// Route to get all folders
folderRoutes.get('/all', getFolders);

// Route to delete an folder by ID
folderRoutes.delete('/delete/:id', deleteFolder);

export default folderRoutes;
