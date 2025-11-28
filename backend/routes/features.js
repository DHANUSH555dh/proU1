const express = require('express');
const router = express.Router();
const RoomFeature = require('../models/RoomFeature');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check admin role
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Get all active room features (public)
router.get('/', async (req, res) => {
  try {
    const features = await RoomFeature.find({ isActive: true }).sort({ name: 1 });
    res.json(features);
  } catch (error) {
    console.error('Error fetching room features:', error);
    res.status(500).json({ message: 'Server error fetching features', error: error.message });
  }
});

// Get all room features including inactive (admin only)
router.get('/all', authenticateToken, isAdmin, async (req, res) => {
  try {
    const features = await RoomFeature.find({}).sort({ name: 1 });
    res.json(features);
  } catch (error) {
    console.error('Error fetching all room features:', error);
    res.status(500).json({ message: 'Server error fetching features', error: error.message });
  }
});

// Create new room feature (admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, icon, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Feature name is required' });
    }

    // Check if feature already exists
    const existingFeature = await RoomFeature.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingFeature) {
      return res.status(400).json({ message: 'Feature with this name already exists' });
    }

    const feature = new RoomFeature({
      name: name.trim(),
      icon: icon || '🏨',
      description: description || ''
    });

    await feature.save();
    res.status(201).json({ 
      message: 'Room feature created successfully', 
      feature 
    });
  } catch (error) {
    console.error('Error creating room feature:', error);
    res.status(500).json({ message: 'Server error creating feature', error: error.message });
  }
});

// Update room feature (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, icon, description, isActive } = req.body;
    
    const feature = await RoomFeature.findById(req.params.id);
    if (!feature) {
      return res.status(404).json({ message: 'Feature not found' });
    }

    // Check if new name conflicts with existing feature
    if (name && name !== feature.name) {
      const existingFeature = await RoomFeature.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });

      if (existingFeature) {
        return res.status(400).json({ message: 'Feature with this name already exists' });
      }
    }

    // Update fields
    if (name) feature.name = name.trim();
    if (icon) feature.icon = icon;
    if (description !== undefined) feature.description = description;
    if (isActive !== undefined) feature.isActive = isActive;

    await feature.save();
    res.json({ 
      message: 'Room feature updated successfully', 
      feature 
    });
  } catch (error) {
    console.error('Error updating room feature:', error);
    res.status(500).json({ message: 'Server error updating feature', error: error.message });
  }
});

// Delete room feature (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const feature = await RoomFeature.findById(req.params.id);
    
    if (!feature) {
      return res.status(404).json({ message: 'Feature not found' });
    }

    await RoomFeature.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room feature deleted successfully' });
  } catch (error) {
    console.error('Error deleting room feature:', error);
    res.status(500).json({ message: 'Server error deleting feature', error: error.message });
  }
});

module.exports = router;