import mongoose from 'mongoose';

const clusterSchema = new mongoose.Schema({
  encoding: { type: [Number], required: true },
  eventId: { type: mongoose.Schema.ObjectId, required: true, ref: 'Event' },
  createdAt: { type: Date, default: Date.now },
  // Other fields as needed
});

const Clusters = mongoose.model('Cluster', clusterSchema);

export default Clusters;
