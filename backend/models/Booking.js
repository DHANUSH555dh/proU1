const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    required: true
  },
  guests: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  bookingCode: {
    type: String,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-generate booking code BEFORE validation
bookingSchema.pre('validate', function(next) {
  if (!this.bookingCode) {
    this.bookingCode = 'HBK-' + Math.floor(100000 + Math.random() * 900000);
  }
  
  // Validate check-out is after check-in
  if (this.checkOut && this.checkIn && this.checkOut <= this.checkIn) {
    return next(new Error('Check-out date must be after check-in date'));
  }
  
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
