import mongoose from "mongoose";

const CropRecommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  nitrogen: { type: Number, required: true },
  phosphorus: { type: Number, required: true },
  potassium: { type: Number, required: true },
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },
  pH: { type: Number, required: true },
  rainfall: { type: Number, required: true },
  recommendedCrop: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const CropRecommendations = mongoose.model("CropRecommendations", CropRecommendationSchema);

export default CropRecommendations;
