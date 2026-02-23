import mongoose from 'mongoose';

const Campaignschema = new mongoose.Schema({
  name: { type: String, required: true },
  targetProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  budget: { type: Number },
  startDate: { type: Date },
  endDate: { type: Date }
});

const Campaign = mongoose.model("Campaign" , Campaignschema);
export default Campaign;