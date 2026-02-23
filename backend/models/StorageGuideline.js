import mongoose from 'mongoose';

const storageGuidelineSchema = new mongoose.Schema({
  cropType: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  storageRequirements: {
    type: [String],
    required: true
  },
  handlingProcedures: {
    type: [String],
    required: true
  },
  notes: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const StorageGuideline = mongoose.model('StorageGuideline', storageGuidelineSchema);

export default StorageGuideline;