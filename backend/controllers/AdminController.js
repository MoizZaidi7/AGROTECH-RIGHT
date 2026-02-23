import Complaint from '../models/Complaint.js';
import Report from '../models/Reports.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/sendemail.js';
import { generateWelcomeEmail } from '../utils/emailTemplates.js';
import bcrypt from 'bcryptjs';


const getRegisteredUsers = async (req, res) => {
    try {
      const users = await User.find().select('-password'); 
      res.status(200).json({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Error fetching users. Please try again or contact support.' });
    }
  };
  
  
const updateUserDetails = async (req, res) => {
    const { userId } = req.params; 
    const { username, email, userType } = req.body; 
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (username) user.username = username;
      if (email) user.email = email;
      if (userType) user.userType = userType;
  
      await user.save();
      res.status(200).json({ message: 'User details updated successfully', user });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Error updating user details. Please try again or contact support.' });
    }
  };
  
  
const deleteUser = async (req, res) => {
    const { userId } = req.params; // User ID to delete
  
    try {
      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const emailContent = `Your account has been deleted by an administrator.`;
      await sendEmail({
        email: user.email,
        subject: 'Account Deletion Notification',
        htmlMessage: emailContent,
      });
  
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Error deleting user. Please try again or contact support.' });
    }
  };

const fetchComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find();
    res.status(200).json({ complaints });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ message: 'Error fetching complaints. Please try again or contact support.' });
  }
};

const resolveComplaints = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status, adminResponse } = req.body;

    console.log("🔹 Resolving Complaint:", { complaintId, status, adminResponse });

    // Check if `status` is valid
    const validStatuses = ["pending", "in progress", "resolved", "closed"];
    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    // Find complaint
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      console.error("❌ Complaint not found:", complaintId);
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Update complaint status
    complaint.status = status.toLowerCase();
    complaint.resolutionText = adminResponse || "Resolved by admin";
    complaint.resolvedBy = req.user.id;
    complaint.updatedAt = Date.now(); // Update timestamp

    await complaint.save();

    console.log("✅ Complaint Updated Successfully:", complaint);

    return res.status(200).json({
      message: "Complaint updated successfully",
      complaint
    });

  } catch (error) {
    console.error("❌ Error resolving complaint:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


const generateReport = async (req, res) => {
  const { reportType, filters } = req.body; 
  try {
    const reportData = {}; 
    const newReport = new Report({
      reportType,
      generatedBy: req.user.id,
      reportData,
      filters,
    });

    await newReport.save();
    res.status(200).json({ message: 'Report generated successfully', report: newReport });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Error generating report. Please try again or contact support.' });
  }
};

const fetchReports = async (req, res) => {
  try {
    const reports = await Report.find().populate('generatedBy', 'username email'); 
    res.status(200).json({ reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports. Please try again or contact support.' });
  }
};

const registerUserByAdmin = async (req, res) => {
  const { username, email, password, userType } = req.body;
  const validUserTypes = ['Admin', 'Farmer', 'Customer', 'Seller'];

  try {
    if (!validUserTypes.includes(userType)) {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      userType,
      isActive: true, 
    });

    await newUser.save();

    const welcomeMessage = generateWelcomeEmail(newUser.username);
    await sendEmail({
      email,
      subject: 'Welcome to AgroTech!',
      htmlMessage: welcomeMessage,
    });

    res.status(201).json({ message: 'User created successfully and welcome email sent' });
  } catch (error) {
    console.error('Error registering user by admin:', error);
    res.status(500).json({ message: 'Error registering user. Please try again or contact support.' });
  }
};




export {getRegisteredUsers, updateUserDetails, deleteUser, fetchComplaints, resolveComplaints, generateReport, fetchReports, registerUserByAdmin}
