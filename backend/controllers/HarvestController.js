// 📁 controllers/HarvestController.js
import HandlingGuide from "../models/HandlingGuide.js";
import HarvestEquipment from "../models/HarvestEquipment.js";
import HarvestRecommendation from "../models/HarvestRecommendation.js";
import HarvestSchedule from "../models/HarvestSchedule.js";
import { sendNotification } from "../utils/SendNotification.js";


const createSchedule = async (req, res) => {
  try {
    const { cropType, quantity, preferredDate, notes } = req.body;
    const farmerId = req.user.id; // Get the farmer's ID from the logged-in user

    // Check for existing schedule for the same crop around the same time
    const existingSchedule = await HarvestSchedule.findOne({
      farmerId,
      cropType,
      preferredDate: {
        $gte: new Date(new Date(preferredDate).setDate(new Date(preferredDate).getDate() - 3)),
        $lte: new Date(new Date(preferredDate).setDate(new Date(preferredDate).getDate() + 3))
      }
    });

    if (existingSchedule) {
      return res.status(400).json({
        error: 'You already have a harvest schedule for this crop around the same time'
      });
    }

    // Create new harvest schedule
    const schedule = new HarvestSchedule({
      farmerId, // farmer ID
      cropType,
      quantity,
      preferredDate,
      notes
    });

    await schedule.save();

    // Send notification
    await sendNotification({
      userId: farmerId,
      title: 'Harvest Scheduled',
      message: `Your ${cropType} harvest is scheduled for ${preferredDate}`,
      type: 'harvest'
    });

    res.status(201).json(schedule);
  } catch (err) {
    res.status(400).json({ 
      error: 'Failed to create schedule',
      details: err.message 
    });
  }
};

const getSchedules = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { status, startDate, endDate } = req.query;
    
    let query = { farmerId };
    
    if (status) query.status = status;
    if (startDate && endDate) {
      query.preferredDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const schedules = await HarvestSchedule.find(query)
      .populate('equipmentRequested', 'name type availability')
      .sort({ preferredDate: 1 });

    res.json({
      count: schedules.length,
      schedules
    });
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to fetch schedules',
      details: err.message 
    });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const scheduleId = req.params.id;
    const updates = req.body;

    const schedule = await HarvestSchedule.findOneAndUpdate(
      { _id: scheduleId, farmerId: req.user.id }, // ensures user owns the schedule
      updates,
      { new: true, runValidators: true }
    );

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found or unauthorized' });
    }

    res.json(schedule);
  } catch (err) {
    res.status(400).json({ 
      error: 'Failed to update schedule',
      details: err.message 
    });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const scheduleId = req.params.id;
    const userId = req.user.id;

    // Check that the schedule exists and belongs to the authenticated farmer
    const schedule = await HarvestSchedule.findOne({ _id: scheduleId, farmerId: userId });

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found or unauthorized' });
    }

    await schedule.deleteOne();

    res.json({ message: 'Schedule deleted successfully' });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to delete schedule',
      details: err.message
    });
  }
};



const getRecommendations = async (req, res) => {
  try {
    const { cropType } = req.query;
    
    if (!cropType) {
      return res.status(400).json({ error: 'Crop type is required' });
    }
    
    const recommendation = await HarvestRecommendation.findOne({ 
      cropType: new RegExp(cropType, 'i') 
    });
    
    if (!recommendation) {
      return res.status(404).json({ 
        error: 'No recommendations found for this crop type',
        suggestions: await HarvestRecommendation.distinct('cropType')
      });
    }
    
    res.json(recommendation);
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to fetch recommendations',
      details: err.message 
    });
  }
};

const createRecommendation = async (req, res) => {
  try {
    // Destructure the request body to get the required fields
    const { cropType, optimalHarvestTime, yieldEstimation, qualityIndicators, specialNotes } = req.body;

    // Validate input
    if (!cropType || !optimalHarvestTime || !yieldEstimation || !qualityIndicators || !specialNotes) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Create a new recommendation object
    const newRecommendation = new HarvestRecommendation({
      cropType,
      optimalHarvestTime,
      yieldEstimation,
      qualityIndicators,
      specialNotes
    });

    // Save the new recommendation to the database
    await newRecommendation.save();

    // Respond with the newly created recommendation
    res.status(201).json({
      message: 'Recommendation created successfully',
      recommendation: newRecommendation
    });
  } catch (err) {
    // Handle errors and send a response
    res.status(500).json({
      error: 'Failed to create recommendation',
      details: err.message
    });
  }
};

const getEquipment = async (req, res) => {
  try {
    const { type, availability, mode, search, minPrice, maxPrice } = req.query;
    
    let query = {};
    
    if (type) query.type = type;
    if (availability) query.availability = availability;
    if (mode) query.mode = mode;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    const equipment = await HarvestEquipment.find(query)
      .sort({ price: 1 });
    
    res.json({
      count: equipment.length,
      equipment
    });
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to fetch equipment',
      details: err.message 
    });
  }
};

const getAllEquipment = async (req, res) => {
  try {
    const equipment = await HarvestEquipment.find().sort({ name: 1 });
    
   res.json(requests);

  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to fetch all equipment',
      details: err.message 
    });
  }
};

const requestEquipment = async (req, res) => {
  try {
    const { scheduleId, equipmentId, startDate, endDate } = req.body;
    const farmerId = req.user.id; // Assuming authenticated user
    
    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }
    
    const [schedule, equipment] = await Promise.all([
      HarvestSchedule.findById(scheduleId),
      HarvestEquipment.findById(equipmentId)
    ]);
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    if (equipment.availability !== 'Available') {
      return res.status(400).json({ 
        error: 'Equipment not available',
        nextAvailable: equipment.rentalHistory
          .filter(r => r.status === 'Active')
          .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))[0]?.endDate
      });
    }
    
    // Check for conflicts
    const conflictingRental = await HarvestEquipment.findOne({
      _id: equipmentId,
      'rentalHistory.status': 'Active',
      $or: [
        { 'rentalHistory.startDate': { $lte: new Date(endDate) }, 
        'rentalHistory.endDate': { $gte: new Date(startDate) }
      }
      ]
    });
    
    if (conflictingRental) {
      return res.status(409).json({ 
        error: 'Equipment already booked for the selected dates' 
      });
    }
    
    // Update equipment
    equipment.availability = 'Rented Out';
    equipment.rentalHistory.push({
      farmerId,
      scheduleId,
      startDate,
      endDate,
      status: 'Active'
    });
    
    // Update schedule
    if (!schedule.equipmentRequested.includes(equipmentId)) {
      schedule.equipmentRequested.push(equipmentId);
    }
    
    await Promise.all([equipment.save(), schedule.save()]);
    
    // Send notifications
    await sendNotification({
      userId: farmerId,
      title: 'Equipment Request Confirmed',
      message: `Your request for ${equipment.name} has been confirmed`,
      type: 'equipment'
    });
    
    res.json({ 
      message: 'Equipment request processed successfully',
      schedule,
      equipment
    });
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to process equipment request',
      details: err.message 
    });
  }
};

const getHandlingGuide = async (req, res) => {
  try {
    const { cropType } = req.query;

    if (!cropType) {
      return res.status(400).json({ error: 'Crop type is required' });
    }

    const guide = await HandlingGuide.findOne({
      cropType: new RegExp(cropType, 'i')
    });

    if (!guide) {
      return res.status(404).json({
        error: 'No handling guide found for this crop type',
        suggestions: await HandlingGuide.distinct('cropType')
      });
    }

    res.json(guide);
  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch handling guide',
      details: err.message
    });
  }
};


// Additional controller for equipment return
const returnEquipment = async (req, res) => {
  try {
    const { rentalId, equipmentId, actualReturnDate } = req.body;
    
    const equipment = await HarvestEquipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    const rental = equipment.rentalHistory.id(rentalId);
    if (!rental) {
      return res.status(404).json({ error: 'Rental record not found' });
    }
    
    rental.status = 'Completed';
    rental.actualReturnDate = actualReturnDate || new Date();
    equipment.availability = 'Available';
    
    await equipment.save();
    
    res.json({ 
      message: 'Equipment returned successfully',
      equipment
    });
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to process equipment return',
      details: err.message 
    });
  }
};

const addEquipment = async (req, res) => {
  try {
    const { name, type, usage, price, availability, mode, description } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!mode) {
      return res.status(400).json({ error: 'Mode is required' });
    }

    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const newEquipment = new HarvestEquipment({
      name,
      type,
      usage,
      price,
      availability,
      mode,
      description,
      image
    });

    await newEquipment.save();

    res.status(201).json({
      message: 'New equipment added successfully',
      equipment: newEquipment
    });

  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: 'Validation error', details: errors });
    }
    res.status(500).json({ error: 'Failed to add equipment', details: err.message });
  }
};



// Admin removes equipment
// Admin removes equipment
const removeEquipment = async (req, res) => {
  try {
    const { equipmentId } = req.params;
    
    const equipment = await HarvestEquipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Optionally, you can check if the equipment is rented out
    if (equipment.availability === 'Rented Out') {
      return res.status(400).json({ error: 'Cannot remove equipment that is currently rented out' });
    }

    // Use findByIdAndDelete to remove the equipment
    await HarvestEquipment.findByIdAndDelete(equipmentId);

    res.json({ message: 'Equipment removed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove equipment', details: err.message });
  }
};


// Admin accepts an equipment rental request
const acceptEquipmentRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await HarvestEquipment.findById(requestId).populate('equipmentId scheduleId');
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const { equipmentId, scheduleId, startDate, endDate } = request;

    // Check if the equipment is available
    if (equipmentId.availability !== 'Available') {
      return res.status(400).json({ error: 'Equipment is not available' });
    }

    // Check if there's no conflicting rental already
    const conflictingRental = await HarvestEquipment.findOne({
      _id: equipmentId._id,
      'rentalHistory.status': 'Active',
      $or: [
        { 'rentalHistory.startDate': { $lte: new Date(endDate) }, 'rentalHistory.endDate': { $gte: new Date(startDate) } }
      ]
    });

    if (conflictingRental) {
      return res.status(409).json({ error: 'Equipment already booked for the selected dates' });
    }

    // Accept the request: Update equipment and schedule
    equipmentId.availability = 'Rented Out';
    equipmentId.rentalHistory.push({
      farmerId: request.farmerId,
      scheduleId: scheduleId._id,
      startDate,
      endDate,
      status: 'Active'
    });

    // Update schedule with equipment request
    if (!scheduleId.equipmentRequested.includes(equipmentId._id)) {
      scheduleId.equipmentRequested.push(equipmentId._id);
    }

    // Save the equipment and schedule
    await Promise.all([equipmentId.save(), scheduleId.save()]);

    // Send notifications
    await sendNotification({
      userId: request.farmerId,
      title: 'Equipment Rental Accepted',
      message: `Your request for ${equipmentId.name} has been accepted.`,
      type: 'equipment'
    });

    res.json({
      message: 'Equipment rental request accepted',
      equipment: equipmentId,
      schedule: scheduleId
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept rental request', details: err.message });
  }
};

// Admin rejects an equipment rental request
const rejectEquipmentRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await HarvestEquipment.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Reject the request
    request.status = 'Rejected';
    await request.save();

    // Send rejection notification
    await sendNotification({
      userId: request.farmerId,
      title: 'Equipment Rental Rejected',
      message: `Your request for equipment has been rejected.`,
      type: 'equipment'
    });

    res.json({ message: 'Equipment rental request rejected' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject rental request', details: err.message });
  }
};

const createHandlingGuide = async (req, res) => {
  try {
    const {
      cropType,
      toolHandling,
      cropHandling,
      storageRequirements,
      packagingSuggestions
    } = req.body;

    // Validate required fields
    if (
      !cropType ||
      !toolHandling ||
      !cropHandling ||
      !Array.isArray(cropHandling) ||
      !storageRequirements ||
      !packagingSuggestions ||
      !Array.isArray(packagingSuggestions)
    ) {
      return res.status(400).json({
        error: 'All required fields must be provided in the correct format.'
      });
    }

    // Check if a guide already exists for this crop type (case-insensitive)
    const existing = await HandlingGuide.findOne({ cropType: new RegExp(`^${cropType}$`, 'i') });
    if (existing) {
      return res.status(409).json({
        error: `Handling guide for "${cropType}" already exists.`
      });
    }

    // Create and save new handling guide
    const newGuide = new HandlingGuide({
      cropType,
      toolHandling,
      cropHandling,
      storageRequirements,
      packagingSuggestions
    });

    await newGuide.save();

    res.status(201).json({
      message: 'Handling guide created successfully.',
      guide: newGuide
    });

  } catch (err) {
    res.status(500).json({
      error: 'Failed to create handling guide',
      details: err.message
    });
  }
};
// Fetch Equipment Requests
const fetchEquipmentRequests = async (req, res) => {
  try {
    const { status, farmerId, equipmentId } = req.query;

    // Construct query object
    let query = {};

    if (equipmentId) query._id = equipmentId;

    const equipmentRecords = await HarvestEquipment.find(query)
      .populate("rentalHistory.farmerId", "firstName email")
      .sort({ createdAt: -1 });

    // Flatten rental history for filtering
    const requests = equipmentRecords.flatMap(equipment => {
      return equipment.rentalHistory
        .filter(rental => {
          let match = true;
          if (status) match = match && rental.status === status;
          if (farmerId) match = match && rental.farmerId?.toString() === farmerId;
          return match;
        })
        .map(rental => ({
          equipmentId: equipment._id,
          equipmentName: equipment.name,
          equipmentType: equipment.type,
          equipmentAvailability: equipment.availability,
          farmer: rental.farmerId,
          scheduleId: rental.scheduleId,
          startDate: rental.startDate,
          endDate: rental.endDate,
          status: rental.status
        }));
    });

    res.json({
      count: requests.length,
      requests
    });

  } catch (err) {
    res.status(500).json({ 
      error: "Failed to fetch equipment requests",
      details: err.message 
    });
  }
};

// Add this to HarvestController.js
const markEquipmentForMaintenance = async (req, res) => {
  try {
    const { equipmentId } = req.params;

    // Find the equipment and update its status
    const equipment = await Equipment.findByIdAndUpdate(
      equipmentId,
      { status: 'Maintenance' },
      { new: true }
    );

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    res.status(200).json({
      message: 'Equipment marked for maintenance successfully',
      equipment
    });
  } catch (error) {
    console.error('Error marking equipment for maintenance:', error);
    res.status(500).json({ 
      message: 'Failed to mark equipment for maintenance',
      error: error.message 
    });
  }
};



export {fetchEquipmentRequests, getAllEquipment, createSchedule, updateSchedule, getSchedules, getEquipment,createHandlingGuide, getRecommendations, requestEquipment, getHandlingGuide, returnEquipment, addEquipment, removeEquipment, acceptEquipmentRequest, rejectEquipmentRequest, createRecommendation, deleteSchedule, markEquipmentForMaintenance}