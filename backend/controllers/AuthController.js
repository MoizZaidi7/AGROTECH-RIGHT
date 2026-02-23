import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { validatePassword } from '../utils/validatePassword.js';
import { generateOTP } from '../utils/otpGenerator.js';
import { hashOTP } from '../utils/hashotp.js';
import generateToken from '../utils/generateToken.js';
import { sendEmail  } from '../utils/sendEmail.js';
import { generateWelcomeEmail, generateOtpEmail } from '../utils/emailTemplates.js';

const registerUser = async (req, res) => {
    const { username, firstName, lastName, email, password, userType, phoneNumber, otp } = req.body;

    try {
        // OTP Verification Flow
        if (otp) {
            const user = await User.findOne({ email });
            if (!user) return res.status(404).json({ message: 'User not found' });

            if (user.verificationTokenExpire < Date.now()) {
                await User.findByIdAndDelete(user._id); // Delete expired user
                return res.status(400).json({ message: 'OTP expired. Please register again.' });
            }

            const hashedOtp = hashOTP(otp);
            if (user.verificationToken !== hashedOtp) {
                return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
            }

            // Activate the user account
            user.verificationToken = undefined;
            user.verificationTokenExpire = undefined;
            user.isActive = true;
            await user.save();

            // Send Welcome Email
            const welcomeMessage = generateWelcomeEmail(user.username);
            await sendEmail({
                email: user.email,
                subject: 'Welcome to AgroTech!',
                htmlMessage: welcomeMessage,
            });

            return res.status(200).json({ message: 'Account activated successfully. Welcome email sent.' });
        }

        // Registration Flow
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        // Validate userType
        const validUserTypes = ['Admin', 'Farmer', 'Customer', 'Seller'];
        if (!validUserTypes.includes(userType)) {
            return res.status(400).json({ message: 'Invalid user type' });
        }

        // Restrict to one Admin registration
        if (userType === 'Admin') {
            const existingAdmin = await User.findOne({ userType: 'Admin' });
            if (existingAdmin) {
                return res.status(400).json({ message: 'An admin is already registered. Only one admin is allowed.' });
            }
        }

        // Validate password
        const { isValid, message } = validatePassword(password);
        if (!isValid) {
            return res.status(400).json({ message });
        }

        // Hash the password and generate OTP
        const hashedPassword = await bcrypt.hash(password, 10);
        const otpCode = generateOTP();
        const hashedOtp = hashOTP(otpCode);

        const newUser = new User({
            username,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phoneNumber,
            userType,
            verificationToken: hashedOtp,
            verificationTokenExpire: Date.now() + 10 * 60 * 1000, // 10 minutes
            isActive: false, // User inactive until OTP is verified
        });

        await newUser.save();

        // Send OTP via email
        const otpMessage = generateOtpEmail(username, otpCode);
        await sendEmail({
            email,
            subject: 'Activate Your AgroTech Account',
            htmlMessage: otpMessage,
        });

        res.status(201).json({ message: 'OTP sent to your email for account activation' });
    } catch (error) {
        if (error.name === 'ValidationError') {
        if (error.errors.email) {
            return res.status(400).json({ message: error.errors.email.message });
        }
    }
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user', error });
    }
};

// Login an existing user
const loginUser = async (req, res) => {
    const { email, password, rememberMe } = req.body;

    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.isActive) {
            return res.status(403).json({ message: 'Account is not active. Please verify your email.' });
        }

        // If user is already logged in, force logout the previous session
        // This allows the user to login again even if they closed the browser without logging out
        if (user.isLoggedIn) {
            console.log(`User ${user.email} has an active session. Forcing logout of previous session.`);
            user.isLoggedIn = false;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).json({ message: 'Invalid credentials' });

        const expiresIn = rememberMe ? '7d' : '1h';
        const token = generateToken(user._id, expiresIn);

        user.isLoggedIn = true;
        await user.save();

        res.status(200).json({
            message: 'Login successful',
            user: { username: user.username, email: user.email, userType: user.userType },
            token, expiresIn
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Error logging in', error });
    }
};


const googleLogin = async (req, res) => {
    const { email, googleId, name, profilePicture } = req.body;
  
    try {
      // Validate required fields
      if (!email || !googleId || !name) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      // Check if the user exists
      let user = await User.findOne({ email });
  
      // If the user does not exist, create a new one
      if (!user) {
        user = new User({
          username: name,
          email,
          googleId, // Set Google ID for Google login
          profilePicture,
          userType: 'Customer', // Default user type for Google sign-in
          isActive: true,       // Google users are active by default
          isLoggedIn: true,     // Set logged in state
        });
  
        await user.save();
      } else {
        // If user exists, force logout previous session if needed
        if (user.isLoggedIn) {
          console.log(`Google user ${user.email} has an active session. Forcing logout of previous session.`);
        }
        
        // If the user exists but does not have a Google ID, update it
        if (!user.googleId && googleId) {
          user.googleId = googleId;
        }
        
        user.isLoggedIn = true;
        await user.save();
      }
  
      // Generate JWT token (ensure generateToken is defined elsewhere in your code)
      const token = generateToken(user._id, '7d'); // Token valid for 7 days
  
      // Return success response with user data and token
      res.status(200).json({
        message: 'Google login successful',
        user: {
          username: user.username,
          email: user.email,
          userType: user.userType,
          profilePicture: user.profilePicture,
        },
        token,
        expiresIn: '7d',
      });
    } catch (error) {
      console.error('Error in Google login:', error);
      res.status(500).json({ message: 'Error logging in with Google', error });
    }
  };

  
const logoutUser = async (req, res) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token not provided' });

    try {

        const user = await User.findById(req.user.id);
        if (!user) {
            console.error(`User with ID ${req.user.id} not found.`);
            return res.status(404).json({ message: 'User not found. Please check the token.' });
        }

         // Check if the user is already logged out - just log it, don't block
         if (!user.isLoggedIn) {
            console.log('User already logged out, proceeding anyway');
        }

        // Update login status
        user.isLoggedIn = false;
        await user.save();

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ message: 'Error logging out', error });
    }
};

export { loginUser, registerUser, logoutUser, googleLogin} 