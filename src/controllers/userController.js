// controllers/userController.js

import User from "../models/user.js";

// Get a user by ID
export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.query;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
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

