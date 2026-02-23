import User from '../models/User.js';

const updateLastActivity = async (req, res, next) => {
  if (req.user) {
    try {
      // Update the last activity timestamp for the logged-in user
      await User.findByIdAndUpdate(req.user._id, { lastActivity: new Date() }, { new: true });
    } catch (error) {
      console.error('Error updating last activity:', error);
      return res.status(500).json({ message: 'Failed to update last activity' });
    }
  }
  next();
};

export { updateLastActivity };
