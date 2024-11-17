import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema({
  filename: String,
  eventId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Event',
  },
  folderId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Folder',
  },
  url: String,
  clusterIds: { type: [mongoose.Schema.ObjectId], default: [] },
  createdAt: { type: Date, default: Date.now },
  // Other fields as needed
});

export default mongoose.model('Photo', photoSchema);
