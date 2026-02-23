
// middlewares/authorize.js
import roles from '../config/roles.js';
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.userType; // Assuming userType is attached to req.user
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Access denied: Insufficient role' });
    }
    next();
  };
};

export default authorize;
