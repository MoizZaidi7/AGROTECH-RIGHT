import User from '../models/User.js';  // Import the User model

const INACTIVITY_LIMIT = 1 * 60 * 1000; // 2 minutes in milliseconds

const checkInactivity = async (req, res, next) => {
  try {
    // Get the user ID from the request (assuming it's attached to req.user by authMiddleware)
    const userId = req.user.id;

    // Fetch the user from the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get the current time and the user's last activity time
    const currentTime = new Date().getTime();
    const lastActivityTime = new Date(user.lastActivity).getTime();

    // Calculate the inactivity duration
    const inactivityDuration = currentTime - lastActivityTime;

    if (inactivityDuration > INACTIVITY_LIMIT) {
      // If the user has been inactive for more than the limit, log them out
      user.isLoggedIn = false;
      await user.save();  // Save the updated user status

      return res.status(401).json({ message: 'Session expired due to inactivity' });
    }

    // If the user is still active, continue to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Error checking inactivity:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export { checkInactivity };
