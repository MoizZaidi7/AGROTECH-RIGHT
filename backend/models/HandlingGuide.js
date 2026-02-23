import mongoose from "mongoose";

const HandlingGuideSchema = new mongoose.Schema({
  cropType: { 
    type: String, 
    required: [true, 'Crop type is required'],
    unique: true,
    trim: true
  },
  toolHandling: { 
    type: String,
    required: [true, 'Tool handling instructions are required']
  },
  cropHandling: [{
    stage: String,
    instructions: String,
    precautions: [String]
  }],
  storageRequirements: {
    temperature: String,
    humidity: String,
    duration: String
  },
  packagingSuggestions: [String]
});

const HandlingGuide = mongoose.model('HandlingGuide', HandlingGuideSchema);

export default HandlingGuide