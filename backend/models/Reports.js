import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: {
    type: String,
    enum: ["User Engagement", "Web Analytics", "Sales and Revenue"],
    required: true,
  },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Report = mongoose.model("Report", reportSchema);
export default Report;