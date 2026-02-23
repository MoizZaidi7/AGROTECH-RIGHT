import mongoose from 'mongoose';

const transportSchema = new mongoose.Schema({
  providerName: {
    type: String,
    required: [true, 'Provider name is required'],
    trim: true,
    minlength: [2, 'Provider name must be at least 2 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  vehicleType: {
    type: String,
    enum: ['Truck', 'Van', 'Pickup', 'Refrigerated'],
    required: [true, 'Vehicle type is required'],
    default: 'Truck'
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [100, 'Minimum capacity is 100kg']
  },
  maxDistance: {
    type: Number,
    required: [true, 'Max distance is required'],
    min: [10, 'Minimum distance is 10km']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  availability: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add validation middleware
transportSchema.pre('save', function(next) {
  if (this.price && typeof this.price !== 'number') {
    this.price = Number(this.price);
  }
  next();
});

const Transport = mongoose.model('Transport', transportSchema);

export default Transport;