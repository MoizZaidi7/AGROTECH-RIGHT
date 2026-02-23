// 📁 controllers/TransportController.js
import Transport from '../models/Transport.js';
import PackagingMaterial from '../models/PackagingMaterial.js';
import TransportGuideline from '../models/TransportGuideline.js';
import TransportRequest from '../models/TransportRequest.js';
import { Client } from '@googlemaps/google-maps-services-js';
import axios from 'axios';
const googleMapsClient = new Client({});

// Enhanced getTransportOptions with better error handling
const getTransportOptions = async (req, res) => {
  try {
    const options = await Transport.find({ availability: true })
      .select('providerName price vehicleType capacity maxDistance description availability _id')
      .lean();

    if (!options || options.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No transport options found',
        options: []
      });
    }

    // Validate and transform data
    const validatedOptions = options.map(option => {
      if (!option) return null;
      
      return {
        _id: option._id?.toString(),
        providerName: option.providerName || 'Unknown Provider',
        price: Number(option.price) || 0,
        vehicleType: option.vehicleType || 'Truck',
        capacity: Number(option.capacity) || 0,
        maxDistance: Number(option.maxDistance) || 0,
        description: option.description || 'No description available',
        availability: option.availability !== undefined ? option.availability : true
      };
    }).filter(Boolean);

    res.json({
      success: true,
      count: validatedOptions.length,
      options: validatedOptions
    });

  } catch (error) {
    console.error('Transport options error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transport options',
      details: error.message
    });
  }
};

// Get packaging materials
const getPackagingMaterials = async (req, res) => {
  try {
    const materials = await PackagingMaterial.find();
    res.json({ materials });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch packaging materials' });
  }
};

// Get transport guidelines
const getTransportGuidelines = async (req, res) => {
  try {
    const guidelines = await TransportGuideline.find();
    res.json({ guidelines });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch transport guidelines' });
  }
};

// Enhanced route calculation
const calculateRoute = async (pickup, delivery) => {
  try {
    if (!pickup || !delivery) {
      throw new Error('Both pickup and delivery locations are required');
    }

    const response = await googleMapsClient.directions({
      params: {
        origin: pickup,
        destination: delivery,
        key: process.env.GOOGLE_MAPS_API_KEY,
        mode: 'driving',
        alternatives: false
      },
      timeout: 10000
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Google Maps API error: ${response.data.status}`);
    }

    const route = response.data.routes[0];
    const leg = route.legs[0];

    return {
      distance: leg.distance.value / 1000, // km
      duration: leg.duration.value / 60, // minutes
      distanceText: leg.distance.text,
      durationText: leg.duration.text,
      startAddress: leg.start_address,
      endAddress: leg.end_address,
      polyline: route.overview_polyline.points
    };
  } catch (error) {
    console.error('Route calculation error:', error);
    throw error;
  }
};

// Updated getRouteDetails controller
const getRouteDetails = async (req, res) => {
  try {
    const { pickup, delivery } = req.body;
    
    if (!pickup || !delivery) {
      return res.status(400).json({ 
        error: 'Pickup and delivery locations are required',
        details: 'Please provide both pickup and delivery addresses'
      });
    }

    const route = await calculateRoute(pickup, delivery);
    res.json({ route });
  } catch (error) {
    console.error('Route calculation failed:', {
      error: error.message,
      pickup: req.body.pickup,
      delivery: req.body.delivery,
      timestamp: new Date().toISOString(),
    });
    
    res.status(500).json({ 
      error: error.message || 'Failed to calculate route',
      details: error.response?.data?.error_message || 'Check server logs for details',
      suggestion: 'Please verify the addresses and try again'
    });
  }
};

// Enhanced createTransportRequest
const createTransportRequest = async (req, res) => {
  try {
    const { optionId, ...requestData } = req.body;
    
    // Validate input
    if (!optionId || !requestData.pickupLocation || !requestData.deliveryLocation) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        details: optionId ? 'Pickup and delivery locations are required' : 'Transport option ID is required'
      });
    }

    // Validate transport option exists
    const transportOption = await Transport.findById(optionId);
    if (!transportOption) {
      return res.status(404).json({
        success: false,
        error: 'Transport option not found',
        details: `No transport option found with ID: ${optionId}`
      });
    }

    // Validate packaging material if provided
    if (requestData.packagingType) {
      const packagingExists = await PackagingMaterial.exists({ _id: requestData.packagingType });
      if (!packagingExists) {
        return res.status(400).json({
          success: false,
          error: 'Invalid packaging material',
          details: `No packaging material found with ID: ${requestData.packagingType}`
        });
      }
    }

    // Calculate route with improved error handling
    let routeDetails;
    try {
      routeDetails = await calculateRoute(
        requestData.pickupLocation,
        requestData.deliveryLocation
      );
    } catch (error) {
      console.error('Route calculation failed:', {
        error: error.message,
        pickup: requestData.pickupLocation,
        delivery: requestData.deliveryLocation,
        timestamp: new Date().toISOString(),
      });

      return res.status(400).json({
        success: false,
        error: "Failed to calculate route between locations",
        details: error.message,
        suggestion: "Please verify the addresses are correct and try again"
      });
    }

    // Validate crop quantity against transport capacity
    if (requestData.quantity && requestData.quantity > transportOption.capacity) {
      return res.status(400).json({
        success: false,
        error: 'Quantity exceeds transport capacity',
        details: `Maximum capacity is ${transportOption.capacity} kg`,
        currentQuantity: requestData.quantity
      });
    }

    // Create request
    const newRequest = new TransportRequest({
      farmer: req.user.id,
      transportOption: optionId,
      ...requestData,
      routeDetails,
      estimatedCost: routeDetails.distance * transportOption.price,
      status: 'Pending'
    });

    await newRequest.save();

    // Update transport option availability if needed
    if (transportOption.availability) {
      await Transport.findByIdAndUpdate(optionId, { availability: false });
    }

    res.status(201).json({
      success: true,
      message: 'Transport request created successfully',
      request: newRequest,
      route: routeDetails,
      option: transportOption
    });

  } catch (error) {
    console.error('Create transport request error:', {
      error: error.message,
      stack: error.stack,
      requestBody: req.body,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to create transport request',
      details: error.message,
      suggestion: 'Please try again later or contact support'
    });
  }
};

// Get farmer's transport requests
const getFarmerTransportRequests = async (req, res) => {
  try {
    const requests = await TransportRequest.find({ farmer: req.user.id })
      .populate('transportOption')
      .populate('packagingType');
      
    res.json({ requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch transport requests' });
  }
};

export {getFarmerTransportRequests, getPackagingMaterials, getRouteDetails, getTransportGuidelines, getTransportOptions, createTransportRequest, calculateRoute}