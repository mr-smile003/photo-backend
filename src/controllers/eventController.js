// controllers/eventController.js

import Event from "../models/events.js";

// Generate unique 6 character event number (alphanumeric)
const generateEventNumber = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Check if generated number already exists, if so generate new one
const getUniqueEventNumber = async () => {
  const number = generateEventNumber();
  const existingEvent = await Event.findOne({ eventNumber: number });
  if (existingEvent) {
    return getUniqueEventNumber(); // Recursively try again if number exists
  }
  return number;
};

// Create a new event
export const createEvent = async (req, res) => {
  try {
    const { name, description, date, eventPicture, eventNumber } = req.body;

    const isExistingEvent = await Event.findOne({ eventNumber: eventNumber }).lean()
    if (isExistingEvent) {
      return res.status(400).json({ message: 'An event with this eventNumber already exists.' });
    }
    // Create a new event
    const newEvent = new Event({
      name,
      description,
      date,
      eventPicture,
      eventNumber
    });

    // Save the event to the database
    await newEvent.save();
    return res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({ message: 'Error creating event' });
  }
};

// Get all events
export const getEvents = async (req, res) => {
  try {
    const { folder, eventId } = req.query;
    const filter = folder ? { folder } : {};

    if(eventId) filter._id = eventId
    const events = await Event.find(filter).populate('folders');
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
};

// Delete an event by ID
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Error deleting event' });
  }
};


export const updateEvent = async (req, res) => {
  try {
    const { name, description, date, id, folder, eventNumber } = req.body;

    const isExistingEvent = await Event.findOne({ eventNumber: eventNumber, _id: { $ne: id }})
    if (isExistingEvent) {
      return res.status(400).json({ message: 'An event with this eventNumber already exists.' });
    }
    // Find the event by ID and update it
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { name, description, date, folder, eventNumber },
      { new: true, runValidators: true } // Return the updated document and validate updates
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    return res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
  } catch (error) {
    console.error('Error updating event:', error);
    return res.status(500).json({ message: 'Error updating event' });
  }
};


export const updateFolderInEvent = async (eventId, folderId) => {
  try {
    await Event.findOneAndUpdate(
      { _id: eventId },
      { $push: { folders: folderId } } // Use $push as the operator directly
    );
  } catch (err) {
    console.log("Error:", err);
    return null;
  }
};