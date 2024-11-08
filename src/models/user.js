import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  backgroundPhotoUrl: {
    type: String, // URL of the background photo
    required: false
  },
  socialMedia: {
    whatsapp: {
      type: String,
      required: false
    },
    facebook: {
      type: String,
      required: false
    },
    instagram: {
      type: String,
      required: false
    },
    youtube: {
      type: String,
      required: false
    }
  },
  contactInfo: {
    phoneNumber: {
      type: String,
      required: false
    },
    email: {
      type: String,
      required: false
    },
    website: {
      type: String,
      required: false
    }
  },
  extraDetails: {
    type: String,
    required: false
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

export default mongoose.model('User', userSchema);
