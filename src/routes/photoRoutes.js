import express from 'express';
import multer from 'multer';
import * as photoController from '../controllers/photoController.js';

const router = express.Router();

// Configure multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.array('photos'), photoController.uploadMultiplePhotos);
router.post('/upload', upload.single('file'), photoController.uploadPhoto);
router.get('/event', photoController.getPhotosByEventId);
router.post('/selfie', upload.single('file'), photoController.getSelfiePhotos);
router.get('/:id', photoController.getPhotoById);

export default router;
