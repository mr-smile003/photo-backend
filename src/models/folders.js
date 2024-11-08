import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  eventId: { type: String, required: true },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  folderPicture: { type: String, required: false },
});

const Folder = mongoose.model('Folder', folderSchema);

export default Folder;