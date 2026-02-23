// 📁 models/PackagingMaterial.js
import mongoose from 'mongoose';

const packagingMaterialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  materialType: {
    type: String,
    enum: ['Cardboard', 'Wood', 'Plastic', 'Biodegradable', 'Other'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  weightCapacity: {
    type: Number, // in kg
    required: true
  },
  ecoRating: {
    type: Number,
    min: 1,
    max: 5
  },
  recyclable: {
    type: Boolean,
    default: false
  },
  biodegradable: {
    type: Boolean,
    default: false
  },
  suitableFor: [{
    type: String,
    enum: ['Fruits', 'Vegetables', 'Grains', 'Dairy', 'All']
  }]
});

const PackagingMaterial = mongoose.model('PackagingMaterial', packagingMaterialSchema);

export default PackagingMaterial;