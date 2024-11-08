// routes/eventRoutes.js
import express from 'express';
import { createEvent, getEvents, deleteEvent, updateEvent } from '../controllers/eventController.js';

const eventRoutes = express.Router();

// Route to create an event
eventRoutes.post('/create', createEvent);
eventRoutes.post('/update', updateEvent);

// Route to get all events
eventRoutes.get('/all', getEvents);

// Route to delete an event by ID
eventRoutes.delete('/delete/:id', deleteEvent);

export default eventRoutes;
