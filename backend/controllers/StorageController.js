import StorageFacility from '../models/StorageFacility.js';
import CropAssessment from '../models/CropAssessment.js';
import { getAvailableDates } from '../utils/storageUtils.js';

// Get all storage facilities
const getStorageFacilities = async (req, res) => {
  try {
    const facilities = await StorageFacility.find();
    res.status(200).json({ facilities });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch storage facilities' });
  }
};

// Filter storage facilities
const filterStorageFacilities = async (req, res) => {
  try {
    const { capacity, location, search, minPrice, maxPrice, climateControlled } = req.query;
    
    let query = {};
    
    if (capacity) query.capacity = { $gte: Number(capacity) };
    if (location) query.location = { $regex: location, $options: 'i' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (climateControlled === 'true') query.climateControlled = true;
    
    const facilities = await StorageFacility.find(query);
    res.status(200).json({ facilities });
  } catch (error) {
    res.status(500).json({ error: 'Failed to filter storage facilities' });
  }
};

// Reserve a storage facility
// In your reserveStorageFacility controller
const reserveStorageFacility = async (req, res) => {
  try {
    const { facilityId, startDate, endDate, reservedCapacity } = req.body;
    const farmerId = req.user.id;

    // Validate inputs
    if (!facilityId || !startDate || !endDate || !reservedCapacity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (isNaN(reservedCapacity) || reservedCapacity <= 0) {
      return res.status(400).json({ error: 'Reserved capacity must be a positive number' });
    }

    const facility = await StorageFacility.findById(facilityId);
    if (!facility) {
      return res.status(404).json({ error: 'Storage facility not found' });
    }

    // Calculate available capacity
    const availableCapacity = facility.capacity - (facility.reservedCapacity || 0);
    
    if (reservedCapacity > availableCapacity) {
      return res.status(400).json({ 
        error: `Only ${availableCapacity}kg available (Requested: ${reservedCapacity}kg)`,
        availableCapacity
      });
    }

    // Check for date conflicts
    const hasConflict = facility.reservations.some(reservation => {
      return (
        new Date(startDate) < new Date(reservation.endDate) &&
        new Date(endDate) > new Date(reservation.startDate)
      );
    });

    if (hasConflict) {
      return res.status(400).json({ 
        error: 'Capacity not available for selected dates',
        availableDates: await getAvailableDates(facilityId, reservedCapacity)
      });
    }

    // Add reservation
    facility.reservations.push({
      farmer: farmerId,
      totalCapacity: facility.capacity, // Store the facility's total capacity at time of reservation
      startDate,
      endDate,
      reservedCapacity,
      status: 'pending'
    });

    // Update the facility's reserved capacity
    facility.reservedCapacity = (facility.reservedCapacity || 0) + Number(reservedCapacity);
    await facility.save();

    // Return the updated facility with clear capacity information
    res.status(201).json({ 
      facility: {
        ...facility.toObject(),
        availableCapacity: facility.capacity - facility.reservedCapacity
      }
    });
  } catch (error) {
    console.error('Reservation error:', error);
    res.status(500).json({ error: error.message || 'Failed to reserve facility' });
  }
};


// Get farmer's reservations
const getFarmerReservations = async (req, res) => {
  try {
    const farmerId = req.user.id;
    
    const facilities = await StorageFacility.find({
      'reservations.farmer': farmerId
    }).populate('reservations.farmer', 'name email');
    
    const reservations = facilities.flatMap(facility => 
      facility.reservations
        .filter(reservation => reservation.farmer._id.toString() === farmerId)
        .map(reservation => ({
          ...reservation.toObject(),
          facility: {
            id: facility._id,
            name: facility.name,
            location: facility.location
          }
        }))
    );
    
    res.status(200).json({ reservations });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
};

// Assess crop quality
const assessCropQuality = async (req, res) => {
  try {
    const {
      cropName,
      starchContent,
      sugarContent,
      size,
      color,
      texture,
      moistureContent
    } = req.body;

    const farmerId = req.user.id;

    if (
      !cropName || starchContent == null || sugarContent == null || size == null ||
      !color || !texture || moistureContent == null
    ) {
      return res.status(400).json({ error: 'Missing required crop quality inputs' });
    }

    // Compute a quality score based on simple logic
    let score = 0;
    const predictedFactors = [];

    if (starchContent > 10) { score += 20; predictedFactors.push("High starch content"); }
    if (sugarContent > 8) { score += 20; predictedFactors.push("High sugar content"); }
    if (size > 6.5) { score += 20; predictedFactors.push("Large size"); }
    if (moistureContent >= 70 && moistureContent <= 85) {
      score += 20; predictedFactors.push("Optimal moisture");
    } else if (moistureContent >= 60) {
      score += 10; predictedFactors.push("Acceptable moisture");
    }
    if (["Smooth", "Glossy"].includes(texture)) {
      score += 10; predictedFactors.push("Good texture");
    }
    if (["Green", "Red", "Orange"].includes(color)) {
      score += 10; predictedFactors.push("Desirable color");
    }

    score = Math.min(100, Math.max(0, score));

    // Determine quality label
    let qualityLabel = 'Low';
    if (score >= 80) qualityLabel = 'High';
    else if (score >= 60) qualityLabel = 'Medium';

    // Storage recommendation
    let recommendedStorage = 'Dry Storage';
    if (moistureContent > 85) {
      recommendedStorage = 'Refrigerated';
    } else if (moistureContent > 75) {
      recommendedStorage = 'Controlled Atmosphere';
    } else if (moistureContent > 65) {
      recommendedStorage = 'Cool Storage';
    }

    // Processing recommendation
    let processingRecommendation = 'Immediate Consumption';
    if (qualityLabel === 'High') {
      processingRecommendation = 'Long-term Storage';
    } else if (qualityLabel === 'Medium') {
      processingRecommendation = 'Short-term Storage';
    } else if (qualityLabel === 'Low' && score > 40) {
      processingRecommendation = 'Processing Recommended';
    } else {
      processingRecommendation = 'Not Suitable for Storage';
    }

    const assessment = new CropAssessment({
      farmer: farmerId,
      cropName,
      starchContent,
      sugarContent,
      size,
      color,
      texture,
      moistureContent,
      qualityAssessment: {
        qualityLabel,
        qualityScore: score,
        predictedFactors,
        recommendedStorage,
        processingRecommendation
      },
      modelVersion: '1.0.0',
      confidenceScore: parseFloat((Math.random() * 0.3 + 0.7).toFixed(2)) // confidence between 0.7 - 1.0
    });

    await assessment.save();
    res.status(201).json({ assessment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to assess crop quality' });
  }
};


// Get farmer's crop assessments
const getFarmerAssessments = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const assessments = await CropAssessment.find({ farmer: farmerId })
      .sort({ assessmentDate: -1 });
    res.status(200).json({ assessments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch crop assessments' });
  }
};

export {getFarmerAssessments, getFarmerReservations, getStorageFacilities, assessCropQuality, reserveStorageFacility, filterStorageFacilities}