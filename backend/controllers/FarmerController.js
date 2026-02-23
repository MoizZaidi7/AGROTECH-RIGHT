import Complaint from "../models/Complaint.js";


const createComplaint = async (req, res) => {
    const { complaintText } = req.body;
  
    try {
      // Ensure complaint text is provided
      if (!complaintText) {
        return res.status(400).json({ message: "Complaint text is required" });
      }
  
      // Create a new complaint
      const newComplaint = new Complaint({
        userId: req.user.id, // Assuming `req.user.id` contains the authenticated user's ID
        complaintText,
      });
  
      // Save the complaint to the database
      await newComplaint.save();
  
      res.status(201).json({
        message: "Complaint created successfully",
        complaint: newComplaint,
      });
    } catch (error) {
      console.error("Error creating complaint:", error);
      res.status(500).json({
        message: "Error creating complaint",
        error: error.message,
      });
    }
  };

  const viewComplaint = async (req, res) => {
    const { complaintId } = req.params;
  
    try {
      // Find the specific complaint by ID and ensure it belongs to the logged-in farmer
      const complaint = await Complaint.findOne({
        _id: complaintId,
        userId: req.user.id,
      });
  
      if (!complaint) {
        return res
          .status(404)
          .json({ message: "Complaint not found or unauthorized access" });
      }
  
      res.status(200).json({
        message: "Complaint details fetched successfully",
        complaint,
      });
    } catch (error) {
      console.error("Error fetching complaint details:", error);
      res.status(500).json({
        message: "Error fetching complaint details",
        error: error.message,
      });
    }
  };

  

  export {createComplaint, viewComplaint};