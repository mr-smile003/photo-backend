// controllers/folderController.js

import Event from "../models/events.js";
import Folder from "../models/folders.js";
import { updateFolderInEvent } from "./eventController.js";

// Create a new folder
export const createFolder = async (req, res) => {
  try {
    const { name, description, date, folderPicture, eventId } = req.body;
    
    const evneID = await Event.findOne({ eventNumber: eventId }, { _id: 1 }).lean()
    // Create a new folder
    const newFolder = new Folder({
      name,
      description,
      date,
      folderPicture,
      eventId: evneID?._id
    });

    
    // Save the folder to the database
    const createdFolder = await newFolder.save();
    await updateFolderInEvent(evneID?._id, createdFolder?._id)
    res.status(201).json({ message: 'Folder created successfully', folder: newFolder });
  } catch (error) {
    console.error('Error creating folder:', error);
    return res.status(500).json({ message: 'Error creating folder' });
  }
};

// Get all folders
export const getFolders = async (req, res) => {
  try {
    const { eventNumber } = req.query;
    const eventId = await Event.findOne({ eventNumber: eventNumber }, { _id: 1 }).lean();
    const folders = await Folder.find({ eventId: eventId?._id }).lean();
    return res.status(200).json(folders);
  } catch (error) {
    console.error('Error fetching folders:', error);
    return res.status(500).json({ message: 'Error fetching folders' });
  }
};

// Delete an folder by ID
export const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;

    const folder = await Folder.findByIdAndDelete(id);
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    return res.status(200).json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return res.status(500).json({ message: 'Error deleting folder' });
  }
};


export const updateFolder = async (req, res) => {
  try {
    const { name, description, date, id } = req.body;

    // Find the folder by ID and update it
    const updatedFolder = await Folder.findByIdAndUpdate(
      id,
      { name, description, date },
      { new: true, runValidators: true } // Return the updated document and validate updates
    );

    if (!updatedFolder) {
      return res.status(400).json({ message: 'Folder not found' });
    }

    return res.status(200).json({ message: 'Folder updated successfully', folder: updatedFolder });
  } catch (error) {
    console.error('Error updating folder:', error);
    return res.status(500).json({ message: 'Error updating folder' });
  }
};
