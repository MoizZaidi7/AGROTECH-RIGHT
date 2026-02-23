import express from 'express';
import {
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
  deleteUserAccount,
  getUserProfile,
  createComplaint,
  getComplaintsByUser,
  switchProfile
} from '../controllers/UserController.js';

import {
  googleLogin,
  loginUser,
  logoutUser,
  registerUser
} from '../controllers/AuthController.js';

import authMiddleware from '../middleware/authMiddleware.js';
import { checkInactivity } from '../middleware/inactivity.js';
import { updateLastActivity } from '../middleware/lastactivity.js';

const userRouter = express.Router();

// ✅ Public routes — no inactivity check
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/forgotPassword', forgotPassword);
userRouter.post('/resetPassword/:token', resetPassword);
userRouter.post('/google-login', googleLogin);

// ✅ Protected routes only
// These will use auth + activity middlewares in sequence
const protectedRoutes = express.Router();

protectedRoutes.use(authMiddleware);
protectedRoutes.use(updateLastActivity);

protectedRoutes.post('/logout', logoutUser);
protectedRoutes.get('/UserProfile', getUserProfile);
protectedRoutes.put('/changePassword', changePassword);
protectedRoutes.put('/profile', updateProfile);
protectedRoutes.delete('/delete', deleteUserAccount);
protectedRoutes.post('/complaints/create', createComplaint);
protectedRoutes.get('/complaints', getComplaintsByUser);
protectedRoutes.post('/switch-profile', switchProfile);

// mount protected routes
userRouter.use(protectedRoutes);

export default userRouter;
