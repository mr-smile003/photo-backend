// controllers/userController.js

import User from "../models/user.js";
import { errorResponse, notFoundResponse, successResponse } from "../utils/responseWrapper.js";

// Get a user by ID
export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.query;
    const user = await User.findById(id);

    if (!user) {
      return notFoundResponse(res, 'User not found');
    }

    return successResponse(res, user, 'Events retrieved successfully');
  } catch (error) {
    console.error('Error fetching user:', error);
    return errorResponse(res, 'Error fetching user');
  }
};

// Update a user by ID
export const updateUser = async (req, res) => {
  try {
    const { backgroundPhotoUrl, socialMedia, contactInfo, extraDetails, id } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { backgroundPhotoUrl, socialMedia, contactInfo, extraDetails },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

