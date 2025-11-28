const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const User = require('../models/User');

// Get admin dashboard statistics
router.get('/stats', auth, admin, async (req, res) => {
  try {
    // Total rooms count
    const totalRooms = await Room.countDocuments();
    
    // Total bookings count
    const totalBookings = await Booking.countDocuments();
    
    // Active bookings (confirmed and not yet completed)
    const activeBookings = await Booking.countDocuments({ 
      status: { $in: ['pending', 'confirmed'] }
    });
    
    // Total revenue
    const revenueData = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
    
    // Most booked room type
    const roomTypeStats = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $lookup: { from: 'rooms', localField: 'roomId', foreignField: '_id', as: 'room' } },
      { $unwind: '$room' },
      { $group: { _id: '$room.type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    const mostBookedType = roomTypeStats.length > 0 ? roomTypeStats[0]._id : 'N/A';
    
    // Revenue per month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyRevenue = await Booking.aggregate([
      { 
        $match: { 
          status: { $in: ['confirmed', 'completed'] },
          createdAt: { $gte: sixMonthsAgo }
        } 
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Format monthly revenue data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthlyRevenue = monthlyRevenue.map(item => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      revenue: item.revenue,
      bookings: item.count
    }));
    
    // Room type distribution
    const roomTypeDistribution = await Room.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Recent bookings (last 10)
    const recentBookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('roomId', 'roomNumber type')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalRooms,
      totalBookings,
      activeBookings,
      totalRevenue,
      mostBookedType,
      monthlyRevenue: formattedMonthlyRevenue,
      roomTypeDistribution,
      recentBookings
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error fetching statistics', error: error.message });
  }
});

// Get all bookings with filters (admin only)
router.get('/bookings', auth, admin, async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    let filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    const bookings = await Booking.find(filter)
      .populate('userId', 'name email')
      .populate('roomId', 'roomNumber type price')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error fetching bookings', error: error.message });
  }
});

// Update booking status (admin only)
router.patch('/bookings/:id/status', auth, admin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('userId', 'name email')
     .populate('roomId', 'roomNumber type');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json({ message: 'Booking status updated successfully', booking });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Server error updating booking', error: error.message });
  }
});

module.exports = router;
