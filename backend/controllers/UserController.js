import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import {sendEmail} from '../utils/sendEmail.js';
import crypto from 'crypto';
import generatePasswordResetEmail from '../utils/emailTemplates.js';
import Complaint from '../models/Complaint.js'; 


  const forgotPassword = async (req, res) => {
    const { email  } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.verificationToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.verificationTokenExpire = Date.now() + 400000000;
        await user.save();

        const resetUrl = `http://localhost:3000/resetPassword?token=${resetToken}`;
        const emailcontent = generatePasswordResetEmail(user.username, resetUrl);
        console.log(emailcontent);

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset',
                htmlMessage: emailcontent
            });
            res.status(200).json({ message: 'Reset email sent successfully' });
        } catch (emailError) {
            user.verificationToken = undefined;
            user.verificationTokenExpire = undefined;
            await user.save();
            res.status(500).json({ message: 'Error sending email. Please try again later.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error processing request', error });
    }
};
    // Reset Password
    const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        // Find user by reset token and check expiration
        const verificationToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            verificationToken,
            verificationTokenExpire: { $gt: Date.now() },
        });

        if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

        // Set new password
        user.password = await bcrypt.hash(newPassword, 10);
        user.verificationToken = undefined;
        user.verificationTokenExpire = undefined;

        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error resetting password', error });
    }
};

const updateProfile = async (req, res) => {
  const { firstName, lastName, email, userType, phoneNumber } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.userType = userType || user.userType;
    user.phoneNumber = phoneNumber || user.phoneNumber;

    if (req.file) {
      user.profilePicture = `/uploads/profilePictures/${req.file.filename}`;
    }

    const updatedUser = await user.save();
    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error });
  }
};



const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user });
      } catch (error) {
        res.status(500).json({ message: "Error fetching user profile", error });
      }
    };


const changePassword = async(req, res) => {
  const {currentPassword, newPassword} = req.body;
  try {
    const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if(!isPasswordValid) return res.status(400).json({message:"Current Password is Invalid"});

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      res.status(200).json({message: 'Password Updated Successfully'});
    } catch (error) {
        res.status(500).json({message:'Error updating password', error});

      }

  };

  // Delete user account
const deleteUserAccount = async (req, res) => {
  try {
      await User.findByIdAndDelete(req.user.id);
      res.status(200).json({ message: 'User account deleted successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Error deleting account', error });
  }
};

const createComplaint = async (req, res) => {
  try {
    console.log("Received complaint request:", req.body); // Debugging Step

    const { name, type, details } = req.body;

    if (!name || !type || !details) {
      return res.status(400).json({ message: "All fields (name, type, details) are required." });
    }

    const newComplaint = new Complaint({
      userId: req.user.id, // Assuming `req.user` is set by auth middleware
      name,
      type,
      details,
      status: "pending",
    });

    await newComplaint.save();
    res.status(201).json({ message: "Complaint created successfully", complaint: newComplaint });

  } catch (error) {
    console.error("Error creating complaint:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const getComplaintsByUser = async (req, res) => {
  const userId = req.user.id;

  try {
    const complaints = await Complaint.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ complaints });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ message: 'Error fetching complaints', error });
  }
};

// Switch user profile type
const switchProfile = async (req, res) => {
  const { userType } = req.body;
  
  try {
    // Validate userType
    const validUserTypes = ['Farmer', 'Customer', 'Seller'];
    if (!userType || !validUserTypes.includes(userType)) {
      return res.status(400).json({ 
        message: 'Invalid user type. Must be Farmer, Customer, or Seller' 
      });
    }

    // Find and update user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Admins cannot switch profiles
    if (user.userType === 'Admin') {
      return res.status(403).json({ 
        message: 'Admins cannot switch profiles' 
      });
    }

    // Update userType
    user.userType = userType;
    await user.save();

    res.status(200).json({ 
      message: 'Profile switched successfully',
      user: {
        username: user.username,
        email: user.email,
        userType: user.userType
      }
    });
  } catch (error) {
    console.error('Error switching profile:', error);
    res.status(500).json({ message: 'Error switching profile', error });
  }
};


  export {forgotPassword, resetPassword, updateProfile, getUserProfile, changePassword, deleteUserAccount, createComplaint, getComplaintsByUser, switchProfile};