// 📁 validations/harvestValidation.js
import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error('Invalid ID format');
  }
  return true;
};

// Helper function to validate date is in the future
const isFutureDate = (value) => {
  if (new Date(value) <= new Date()) {
    throw new Error('Date must be in the future');
  }
  return true;
};

const createScheduleSchema = [
  body('cropType')
    .trim()
    .notEmpty().withMessage('Crop type is required')
    .isLength({ max: 50 }).withMessage('Crop type cannot exceed 50 characters'),
  
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1')
    .toInt(),
  
  body('preferredDate')
    .notEmpty().withMessage('Preferred date is required')
    .isISO8601().withMessage('Invalid date format')
    .custom(isFutureDate),
  
  body('notes')
    .optional()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  
  body('equipmentRequested')
    .optional()
    .isArray().withMessage('Equipment requested must be an array')
    .custom((value) => {
      if (!value.every(id => mongoose.Types.ObjectId.isValid(id))) {
        throw new Error('Contains invalid equipment IDs');
      }
      return true;
    })
];

const updateScheduleSchema = [
  param('id')
    .custom(isValidObjectId),
  
  body('cropType')
    .optional()
    .trim()
    .notEmpty().withMessage('Crop type cannot be empty')
    .isLength({ max: 50 }).withMessage('Crop type cannot exceed 50 characters'),
  
  body('quantity')
    .optional()
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1')
    .toInt(),
  
  body('preferredDate')
    .optional()
    .isISO8601().withMessage('Invalid date format')
    .custom(isFutureDate),
  
  body('status')
    .optional()
    .isIn(['Scheduled', 'Completed', 'Cancelled']).withMessage('Invalid status'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  
  body('equipmentRequested')
    .optional()
    .isArray().withMessage('Equipment requested must be an array')
    .custom((value) => {
      if (!value.every(id => mongoose.Types.ObjectId.isValid(id))) {
        throw new Error('Contains invalid equipment IDs');
      }
      return true;
    })
];

const equipmentRequestSchema = [
  body('scheduleId')
    .notEmpty().withMessage('Schedule ID is required')
    .custom(isValidObjectId),
  
  body('equipmentId')
    .notEmpty().withMessage('Equipment ID is required')
    .custom(isValidObjectId),
  
  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid start date format')
    .custom(isFutureDate),
  
  body('endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('Invalid end date format')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    })
];

// Query validations for GET requests
const harvestQueryValidations = {
  getSchedules: [
    query('status')
      .optional()
      .isIn(['Scheduled', 'Completed', 'Cancelled']).withMessage('Invalid status filter'),
    
    query('startDate')
      .optional()
      .isISO8601().withMessage('Invalid start date format'),
    
    query('endDate')
      .optional()
      .isISO8601().withMessage('Invalid end date format')
      .custom((value, { req }) => {
        if (req.query.startDate && new Date(value) < new Date(req.query.startDate)) {
          throw new Error('End date cannot be before start date');
        }
        return true;
      })
  ],
  
  getEquipment: [
    query('type')
      .optional()
      .isIn(['Harvester', 'Tractor', 'Pruner', 'Sprayer', 'Other']).withMessage('Invalid equipment type'),
    
    query('availability')
      .optional()
      .isIn(['Available', 'Rented Out', 'Under Maintenance']).withMessage('Invalid availability status'),
    
    query('mode')
      .optional()
      .isIn(['Rent', 'Purchase', 'Both']).withMessage('Invalid equipment mode'),
    
    query('minPrice')
      .optional()
      .isFloat({ min: 0 }).withMessage('Minimum price must be a positive number')
      .toFloat(),
    
    query('maxPrice')
      .optional()
      .isFloat({ min: 0 }).withMessage('Maximum price must be a positive number')
      .toFloat()
      .custom((value, { req }) => {
        if (req.query.minPrice && value < req.query.minPrice) {
          throw new Error('Max price cannot be less than min price');
        }
        return true;
      }),
    
    query('search')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Search term too long')
  ],
  
  getRecommendations: [
    query('cropType')
      .trim()
      .notEmpty().withMessage('Crop type is required')
  ],
  
  getHandlingGuide: [
    query('cropType')
      .trim()
      .notEmpty().withMessage('Crop type is required')
  ]
};

export {createScheduleSchema, updateScheduleSchema, equipmentRequestSchema, harvestQueryValidations}