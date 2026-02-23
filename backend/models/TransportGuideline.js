// 📁 models/TransportGuideline.js
import mongoose from 'mongoose';

const transportGuidelineSchema = new mongoose.Schema({
  cropType: {
    type: String,
    required: true
  },
  quantityRange: {
    type: String,
    required: true
  },
  packagingRecommendations: [String],
  transportTips: [String],
  temperatureRequirements: {
    min: Number,
    max: Number,
    unit: {
      type: String,
      default: 'Celsius'
    }
  },
  humidityRequirements: {
    min: Number,
    max: Number,
    unit: {
      type: String,
      default: '%'
    }
  },
  specialInstructions: String
});

const TransportGuideline = mongoose.model('TransportGuideline', transportGuidelineSchema);

export default TransportGuideline;