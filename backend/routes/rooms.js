const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Booking = require('../models/Booking');
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

// Get all rooms with search & filter support (public)
router.get('/', async (req, res) => {
  try {
    const { type, minPrice, maxPrice, capacity, search } = req.query;
    
    // Build filter object
    let filter = {};
    
    if (type && type !== 'All') {
      filter.type = type;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    if (capacity) {
      filter.capacity = { $gte: Number(capacity) };
    }
    
    if (search) {
      filter.$or = [
        { type: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { amenities: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const rooms = await Room.find(filter).sort({ roomNumber: 1 });
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Server error fetching rooms', error: error.message });
  }
});

// Get single room by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ message: 'Server error fetching room', error: error.message });
  }
});

// Get bookings for a specific room (public - for availability calendar)
router.get('/:id/bookings', async (req, res) => {
  try {
    const roomId = req.params.id;
    
    const bookings = await Booking.find({ 
      roomId: roomId,
      status: { $in: ['confirmed', 'pending'] }
    }).select('checkIn checkOut status');
    
    // Generate comprehensive list of unavailable dates
    const unavailableDates = [];
    
    // Check if room is out of order - if so, mark all future dates as unavailable
    const room = await Room.findById(roomId);
    const isOutOfOrder = room && room.outOfOrder;
    
    console.log(`Processing ${bookings.length} bookings for room ${roomId}. Out of order: ${isOutOfOrder}`);
    
    if (isOutOfOrder) {
      // Generate unavailable dates for the next 365 days if room is out of order
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        unavailableDates.push(dateString);
      }
      console.log(`Room ${roomId} is out of order - all dates marked unavailable`);
    } else {
      // Process regular bookings
      bookings.forEach(booking => {
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        
        console.log(`Booking: ${booking.checkIn} to ${booking.checkOut} (status: ${booking.status})`);
        
        // Proper date normalization to avoid timezone issues
        // Force dates to local timezone midnight
        checkIn.setHours(0, 0, 0, 0);
        checkOut.setHours(0, 0, 0, 0);
        
        // Include all dates from check-in up to (but not including) check-out
        // Check-in date is unavailable, check-out date is available for new bookings
        const currentDate = new Date(checkIn);
        
        while (currentDate < checkOut) {
          // Use local date string formatting to avoid UTC conversion
          const year = currentDate.getFullYear();
          const month = String(currentDate.getMonth() + 1).padStart(2, '0');
          const day = String(currentDate.getDate()).padStart(2, '0');
          const dateString = `${year}-${month}-${day}`;
          
          unavailableDates.push(dateString);
          console.log(`Added unavailable date: ${dateString}`);
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });
    }
    
    // Remove duplicates and sort
    const uniqueUnavailableDates = [...new Set(unavailableDates)].sort();
    
    console.log(`Final unavailable dates for room ${roomId}:`, uniqueUnavailableDates);
    
    res.json({ 
      bookings: bookings,
      unavailableDates: uniqueUnavailableDates,
      outOfOrder: isOutOfOrder
    });
  } catch (error) {
    console.error('Error fetching room bookings:', error);
    res.status(500).json({ message: 'Server error fetching bookings', error: error.message });
  }
});

// Check room availability for specific dates (public)
router.post('/check-availability', async (req, res) => {
  try {
    const { roomId, checkIn, checkOut } = req.body;

    if (!roomId || !checkIn || !checkOut) {
      return res.status(400).json({ message: 'Room ID, check-in, and check-out dates are required' });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Normalize dates to avoid timezone issues
    checkInDate.setHours(0, 0, 0, 0);
    checkOutDate.setHours(0, 0, 0, 0);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    // Find overlapping bookings for this room with improved logic
    const overlappingBookings = await Booking.find({
      roomId: roomId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        // New booking check-in falls within existing booking (excluding check-out day)
        { checkIn: { $lte: checkInDate }, checkOut: { $gt: checkInDate } },
        // New booking check-out falls within existing booking (excluding check-in day)
        { checkIn: { $lt: checkOutDate }, checkOut: { $gte: checkOutDate } },
        // New booking completely encompasses existing booking
        { checkIn: { $gte: checkInDate }, checkOut: { $lte: checkOutDate } }
      ]
    });

    const isAvailable = overlappingBookings.length === 0;

    // Generate list of unavailable individual dates for response
    const unavailableDatesList = [];
    overlappingBookings.forEach(booking => {
      const start = new Date(booking.checkIn);
      const end = new Date(booking.checkOut);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      
      const currentDate = new Date(start);
      while (currentDate < end) {
        // Use local date string formatting to avoid UTC conversion
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        unavailableDatesList.push(dateString);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    res.json({
      available: isAvailable,
      message: isAvailable 
        ? 'Room is available for the selected dates' 
        : 'Room is not available for the selected dates',
      unavailableDates: [...new Set(unavailableDatesList)].sort(),
      conflictingBookings: overlappingBookings.map(b => ({
        checkIn: b.checkIn,
        checkOut: b.checkOut
      }))
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ message: 'Server error checking availability', error: error.message });
  }
});

// Create new room (admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { roomNumber, type, price, capacity, description, images, amenities, features } = req.body;

    // Check if room number already exists
    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({ message: 'Room number already exists' });
    }

    const room = new Room({
      roomNumber,
      type,
      price,
      capacity,
      description,
      images: images || [],
      amenities: amenities || [],
      features: features || []
    });

    await room.save();
    res.status(201).json({ message: 'Room created successfully', room });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ message: 'Server error creating room', error: error.message });
  }
});

// Update room (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { roomNumber, type, price, capacity, description, images, amenities, features, available } = req.body;

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if new room number conflicts with existing room
    if (roomNumber && roomNumber !== room.roomNumber) {
      const existingRoom = await Room.findOne({ roomNumber });
      if (existingRoom) {
        return res.status(400).json({ message: 'Room number already exists' });
      }
    }

    // Update fields
    if (roomNumber) room.roomNumber = roomNumber;
    if (type) room.type = type;
    if (price !== undefined) room.price = price;
    if (capacity) room.capacity = capacity;
    if (description) room.description = description;
    if (images) room.images = images;
    if (amenities) room.amenities = amenities;
    if (features) room.features = features;
    if (available !== undefined) room.available = available;

    await room.save();
    res.json({ message: 'Room updated successfully', room });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ message: 'Server error updating room', error: error.message });
  }
});

// Toggle room out of order status (admin only)
router.put('/:id/outOfOrder', authenticateToken, isAdmin, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Toggle the outOfOrder status
    room.outOfOrder = !room.outOfOrder;
    await room.save();

    res.json({ 
      message: `Room ${room.roomNumber} ${room.outOfOrder ? 'marked as out of order' : 'set as available'}`,
      room: room
    });
  } catch (error) {
    console.error('Error updating room out of order status:', error);
    res.status(500).json({ message: 'Server error updating room status', error: error.message });
  }
});

// Delete room (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ message: 'Server error deleting room', error: error.message });
  }
});

module.exports = router;
