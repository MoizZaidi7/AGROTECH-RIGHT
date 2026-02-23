import mongoose from "mongoose";

const HarvestEquipmentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Equipment name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  type: { 
    type: String, 
    required: [true, 'Equipment type is required'],
    enum: ['Harvester', 'Tractor', 'Pruner', 'Sprayer', 'Other']
  },
  usage: { 
    type: String,
    maxlength: [200, 'Usage description cannot exceed 200 characters']
  },
  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  availability: { 
    type: String, 
    enum: ['Available', 'Rented Out', 'Under Maintenance'], 
    default: 'Available' 
  },
  mode: { 
    type: String, 
    enum: ['Rent', 'Purchase', 'Both'], 
    required: [true, 'Mode is required'] 
  },
  image: { 
    type: String,
    validate: {
      validator: function(v) {
        return /\.(jpg|jpeg|png|webp)$/.test(v);
      },
      message: props => `${props.value} is not a valid image URL`
    }
  },
  description: { 
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  rentalHistory: [{
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HarvestSchedule'
    },
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Cancelled']
    }
  }]
}, {
  timestamps: true
});

const HarvestEquipment = mongoose.model("HarvestEquipment", HarvestEquipmentSchema);

export default HarvestEquipment;