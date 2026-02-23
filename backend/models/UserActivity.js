import mongoose from "mongoose";

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userType: {
    type: String,
    enum: ['Admin', 'Farmer', 'Customer', 'Seller'],
    required: true,
  },
  activityType: {
    type: String,
    enum: [
      'Login', 
      'Logout', 
      'Crop Sale', 
      'Pesticide Sale', 
      'Fertilizer Sale', 
      'Equipment Rental',
      'Page Visit', 
      'Crop Recommendation', 
      'Soil Analysis',
      'Market Insight',
      'Report Viewed',
      'Filter Applied',
      'Subscription Purchased'
    ],
    required: true,
  },
  pageVisited: {
    type: String,
    required: function () {
      return this.activityType === 'Page Visit';
    },
  },
  actionDetails: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Indexing for faster queries on userId and activityType
userActivitySchema.index({ userId: 1, activityType: 1 });

const UserActivity = mongoose.model('UserActivity', userActivitySchema);

export default UserActivity;
