// 📁 models/TransportRequest.js
import mongoose from 'mongoose';

const transportRequestSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transportOption: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transport',
    required: true
  },
  pickupLocation: {
    type: String,
    required: true
  },
  deliveryLocation: {
    type: String,
    required: true
  },
  pickupDate: {
    type: Date,
    required: true
  },
  deliveryDate: {
    type: Date,
    required: true
  },
  cropType: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  packagingType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PackagingMaterial'
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'In Transit', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  routeDetails: {
    distance: Number,
    estimatedTime: String,
    waypoints: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const TransportRequest = mongoose.model('TransportRequest', transportRequestSchema);

export default TransportRequest;