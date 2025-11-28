const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');
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

// Create new booking (authenticated users)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guests } = req.body;
    const userId = req.user.userId;

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return res.status(400).json({ message: 'Check-in date cannot be in the past' });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if room is out of order
    if (room.outOfOrder) {
      return res.status(400).json({ message: 'Room is currently out of order and cannot be booked' });
    }

    // Check room availability
    if (!room.available) {
      return res.status(400).json({ message: 'Room is not available for booking' });
    }

    // Check room capacity
    if (guests > room.capacity) {
      return res.status(400).json({ message: `Room capacity is ${room.capacity} guests` });
    }

    // Check for conflicting bookings with proper date normalization
    // Normalize dates to avoid timezone issues
    const normalizedCheckIn = new Date(checkInDate.toISOString().split('T')[0]);
    const normalizedCheckOut = new Date(checkOutDate.toISOString().split('T')[0]);
    
    const conflictingBooking = await Booking.findOne({
      roomId,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        // New booking overlaps with existing booking
        // Check if new check-in falls within existing booking (excluding check-out day)
        { checkIn: { $lte: normalizedCheckIn }, checkOut: { $gt: normalizedCheckIn } },
        // Check if new check-out falls within existing booking (excluding check-in day)  
        { checkIn: { $lt: normalizedCheckOut }, checkOut: { $gte: normalizedCheckOut } },
        // Check if new booking completely encompasses existing booking
        { checkIn: { $gte: normalizedCheckIn }, checkOut: { $lte: normalizedCheckOut } }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({ message: 'Room is not available for selected dates' });
    }

    // Calculate total price
    const days = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = days * room.price;

    // Create booking
    const booking = new Booking({
      userId,
      roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalPrice
    });

    await booking.save();

    // Populate room and user details
    await booking.populate('roomId');
    await booking.populate('userId', 'name email');

    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error creating booking', error: error.message });
  }
});

// Get user's bookings
router.get('/user/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;

    // Ensure user can only access their own bookings (unless admin)
    if (req.user.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const bookings = await Booking.find({ userId })
      .populate('roomId')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Server error fetching bookings', error: error.message });
  }
});

// Get all bookings (admin only)
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('roomId')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ message: 'Server error fetching bookings', error: error.message });
  }
});

// Get single booking by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('roomId')
      .populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Ensure user can only access their own booking (unless admin)
    if (booking.userId._id.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Server error fetching booking', error: error.message });
  }
});

// Cancel booking (mark as cancelled)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Ensure user can only cancel their own booking (unless admin)
    if (booking.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if booking is already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // Prevent cancellation if check-in date has passed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDate = new Date(booking.checkIn);
    checkInDate.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return res.status(400).json({ message: 'Cannot cancel booking. Check-in date has already passed.' });
    }

    // Mark booking as cancelled instead of deleting
    booking.status = 'cancelled';
    await booking.save();

    // Populate room details for response
    await booking.populate('roomId');
    await booking.populate('userId', 'name email');

    res.json({ 
      message: 'Booking cancelled successfully',
      booking: booking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Server error cancelling booking', error: error.message });
  }
});

// Update booking status (admin only)
router.patch('/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    res.json({ message: 'Booking status updated successfully', booking });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Server error updating booking', error: error.message });
  }
});

module.exports = router;
