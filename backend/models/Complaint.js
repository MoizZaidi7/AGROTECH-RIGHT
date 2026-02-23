import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['Technical Issues', 'MarketPlace Issues', 'Farm Assistance', 'General Queries', 'Miscellenous Queries'],
  },
  details: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in progress', 'resolved', 'closed'],
    default: 'pending',
    set: (status) => status.toLowerCase() // Automatically convert input to lowercase
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Updated timestamp for tracking changes
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // Default null if not resolved yet
  },
  resolutionText: {
    type: String,
    default: null, // Default to null
  },
}, { timestamps: true }); // Enables auto-createdAt & updatedAt

const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;
