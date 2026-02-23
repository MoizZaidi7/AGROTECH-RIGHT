import mongoose from "mongoose";

const HarvestScheduleSchema = new mongoose.Schema({
  farmerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Farmer ID is required'] 
  },
  cropType: { 
    type: String, 
    required: [true, 'Crop type is required'],
    trim: true
  },
  quantity: { 
    type: Number, 
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  preferredDate: { 
    type: Date, 
    required: [true, 'Preferred date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Preferred date must be in the future'
    }
  },
  status: { 
    type: String, 
    enum: ['Scheduled', 'Completed', 'Cancelled'], 
    default: 'Scheduled' 
  },
  notes: { 
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  equipmentRequested: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HarvestEquipment'
  }]
}, {
  timestamps: true
});

const HarvestSchedule = mongoose.model("HarvestSchedule", HarvestScheduleSchema);

export default HarvestSchedule;