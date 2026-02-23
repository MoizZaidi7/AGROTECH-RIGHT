import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Import the User model

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // Debugging line

    // Fetch the user from the database
    const user = await User.findById(decoded.id).select('userType');
    if (!user) {
      console.error(`User with ID ${decoded.id} not found.`);
      return res.status(404).json({ message: 'User not found' });
    }

    // Attach user data to the request object
    req.user = { id: user._id.toString(), userType: user.userType };
    console.log('User data attached to request:', req.user);

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.error('Token has expired:', error);
      return res.status(401).json({ message: 'Token has expired' });
    } else if (error.name === 'JsonWebTokenError') {
      console.error('Invalid token:', error);
      return res.status(401).json({ message: 'Invalid token' });
    }

    console.error('JWT Verification Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default authMiddleware;
