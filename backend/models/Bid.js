import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  message: { type: String },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  isWinning: { type: Boolean, default: false }
}, { timestamps: true });

const Bid = mongoose.model("Bid" , bidSchema);
export default Bid;