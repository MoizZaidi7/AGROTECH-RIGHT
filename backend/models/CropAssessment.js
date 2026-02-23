import mongoose from 'mongoose';

const cropAssessmentSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cropName: {
    type: String,
    required: true,
    enum: [
      'Pigeonpeas', 'Watermelon', 'Jute', 'Pomegranate', 'Coffee', 
      'Maize', 'Banana', 'Mothbeans', 'Lentil', 'Mango', 
      'Blackgram', 'Muskmelon', 'Rice', 'Papaya', 'Coconut',
      'Cotton', 'Grapes', 'Kidneybeans', 'Orange', 'Apple',
      'Chickpea', 'Mungbean'
    ]
  },
  starchContent: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    description: 'Starch content percentage'
  },
  sugarContent: {
    type: Number,
    required: true,
    min: 0,
    max: 20,
    description: 'Sugar content in °Brix'
  },
  size: {
    type: Number,
    required: true,
    min: 0,
    description: 'Size in centimeters'
  },
  color: {
    type: String,
    required: true,
    enum: ['Green', 'Brown', 'Yellow', 'Orange', 'Purple', 'Red']
  },
  texture: {
    type: String,
    required: true,
    enum: ['Glossy', 'Wrinkled', 'Rough', 'Smooth']
  },
  moistureContent: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    description: 'Moisture content percentage'
  },
  qualityAssessment: {
    qualityLabel: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High']
    },
    qualityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    predictedFactors: {
      type: [String],
      description: 'Key factors influencing the quality assessment'
    },
    recommendedStorage: {
      type: String,
      required: true,
      enum: ['Dry Storage', 'Cool Storage', 'Refrigerated', 'Controlled Atmosphere']
    },
    processingRecommendation: {
      type: String,
      required: true,
      enum: [
        'Immediate Consumption', 
        'Short-term Storage', 
        'Long-term Storage',
        'Processing Recommended',
        'Not Suitable for Storage'
      ]
    }
  },
  assessmentDate: {
    type: Date,
    default: Date.now
  },
  modelVersion: {
    type: String,
    required: true,
    description: 'Version of the ML model used for assessment'
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 1,
    description: 'Model confidence in the assessment'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for frequently queried fields
cropAssessmentSchema.index({ farmer: 1 });
cropAssessmentSchema.index({ cropName: 1 });
cropAssessmentSchema.index({ 'qualityAssessment.qualityLabel': 1 });
cropAssessmentSchema.index({ assessmentDate: -1 });

const CropAssessment = mongoose.model('CropAssessment', cropAssessmentSchema);

export default CropAssessment;