// backend/models/Product.js
import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  breakdown: {
    productQuality: { type: Number, default: 0 },
    shippingSpeed: { type: Number, default: 0 },
    communication: { type: Number, default: 0 }
  },
  average: { type: Number, default: 0 },
  count: { type: Number, default: 0 }
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Food & Produce', // e.g., Organic Vegetables, Grains
        'Farm Inputs',    // e.g., Fertilizers, Pesticides
        'Equipment',      // e.g., Tractors, Irrigation Systems
        'Seeds',          // e.g., Hybrid Seeds
        'Livestock',      // e.g., Chickens, Goats
        'Dairy'           // e.g., Milk, Cheese
      ]
    },
    subCategory: { type: String }, // e.g., "Organic", "Poultry"
    grade: { type: String, enum: ['A', 'B', 'C'] },
    images: [{ type: String }],
    farmingPractices: { type: String }, // e.g., "Organic", "Rainfed"
    certification: { type: String }, // e.g., "USDA Organic"
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isBidding: { type: Boolean, default: false },
    stock: { type: Number, default: 0 },
    harvestDate: { type: Date },
    vendorName: {
      type: String,
      required: true
    },
    vendorLocation: {
      type: String,
      required: true
    },
    vendorRating: {
      type: ratingSchema,
      default: () => ({})
    },
    productionPractices: {
      organic: { type: Boolean, default: false },
      pesticideFree: { type: Boolean, default: false },
      fairTrade: { type: Boolean, default: false }
    },
    certifications: [String]
  },
  { timestamps: true }
);

// Indexes
productSchema.index({ farmerId: 1 });
productSchema.index({ 'vendorRating.average': -1 });
productSchema.index({ vendorLocation: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
