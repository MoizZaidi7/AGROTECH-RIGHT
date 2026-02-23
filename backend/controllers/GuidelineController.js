import StorageGuideline from '../models/StorageGuideline.js';

// Get all storage guidelines
export const getStorageGuidelines = async (req, res) => {
  try {
    const guidelines = await StorageGuideline.find();
    res.status(200).json({ guidelines });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch storage guidelines' });
  }
};

// Get storage guideline by ID
const getStorageGuidelineById = async (req, res) => {
  try {
    const guideline = await StorageGuideline.findById(req.params.id);
    if (!guideline) {
      return res.status(404).json({ error: 'Storage guideline not found' });
    }
    res.status(200).json({ guideline });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch storage guideline' });
  }
};

// Filter guidelines by crop type and grade
const filterGuidelines = async (req, res) => {
  try {
    const { cropType, grade } = req.query;
    let query = {};
    
    if (cropType) query.cropType = cropType;
    if (grade) query.grade = grade;
    
    const guidelines = await StorageGuideline.find(query);
    res.status(200).json({ guidelines });
  } catch (error) {
    res.status(500).json({ error: 'Failed to filter storage guidelines' });
  }
};

// Create storage guideline (admin only)
const createStorageGuideline = async (req, res) => {
  try {
    const { cropType, grade, storageRequirements, handlingProcedures, notes } = req.body;
    
    if (!cropType || !grade || !storageRequirements || !handlingProcedures) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }
    
    const guideline = new StorageGuideline({
      cropType,
      grade,
      storageRequirements: Array.isArray(storageRequirements) ? 
        storageRequirements : 
        [storageRequirements],
      handlingProcedures: Array.isArray(handlingProcedures) ? 
        handlingProcedures : 
        [handlingProcedures],
      notes,
      createdBy: req.user.id
    });
    
    await guideline.save();
    res.status(201).json({ guideline });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create storage guideline' });
  }
};

export {getStorageGuidelineById, filterGuidelines, createStorageGuideline}