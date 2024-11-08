import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  eventPicture: { type: String, required: false },
  folders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Folder' }] 
});

const Event = mongoose.model('Event', eventSchema);

export default Event;