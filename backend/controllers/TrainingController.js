import TrainingModule from '../models/TrainingModule.js';

// Get all training modules
const getTrainingModules = async (req, res) => {
  try {
    const modules = await TrainingModule.find();
    res.status(200).json({ modules });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch training modules' });
  }
};

// Get training module by ID
const getTrainingModuleById = async (req, res) => {
  try {
    const module = await TrainingModule.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ error: 'Training module not found' });
    }
    res.status(200).json({ module });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch training module' });
  }
};

// Create training module (admin only)
const createTrainingModule = async (req, res) => {
  try {
    const { title, description, content, duration, level, category } = req.body;
    
    if (!title || !description || !content || !duration || !category) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }
    
    const module = new TrainingModule({
      title,
      description,
      content,
      duration,
      level: level || 'beginner',
      category,
      createdBy: req.user.id
    });
    
    await module.save();
    res.status(201).json({ module });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create training module' });
  }
};
export {getTrainingModuleById, getTrainingModules, createTrainingModule}