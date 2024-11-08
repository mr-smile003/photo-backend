// routes/userRoutes.js
import express from 'express';
import { getUserDetails, updateUser } from '../controllers/userController.js';


const userRoutes = express.Router();

// Route to create an event
userRoutes.post('/update', updateUser);

// Route to get all events
userRoutes.get('/details', getUserDetails);

export default userRoutes;
