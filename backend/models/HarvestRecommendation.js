import mongoose from "mongoose";

const HarvestRecommendationSchema = new mongoose.Schema({
  cropType: { 
    type: String, 
    required: [true, 'Crop type is required'],
    unique: true,
    trim: true
  },
  tools: [{
    name: String,
    description: String,
    whenToUse: String
  }],
  techniques: [{
    name: String,
    description: String,
    bestFor: String
  }],
  optimalHarvestTime: {
    morning: Boolean,
    afternoon: Boolean,
    evening: Boolean,
    notes: String
  },
  commonMistakes: [String]
});

const HarvestRecommendation = mongoose.model('HarvestRecommendation', HarvestRecommendationSchema);

export default HarvestRecommendation;