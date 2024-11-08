// controllers/eventController.js

import Event from "../models/events.js";

// Create a new event
export const createEvent = async (req, res) => {
  try {
    const { name, description, date, eventPicture } = req.body;
    
    // Create a new event
    const newEvent = new Event({
      name,
      description,
      date,
      eventPicture
    });

    // Save the event to the database
    await newEvent.save();
    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event' });
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
    const { name, description, date, id, folder } = req.body;

    // Find the event by ID and update it
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { name, description, date, folder },
      { new: true, runValidators: true } // Return the updated document and validate updates
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Error updating event' });
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