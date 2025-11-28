const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: Number,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Single', 'Double', 'Suite', 'Deluxe', 'Presidential']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  description: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    default: []
  },
  amenities: {
    type: [String],
    default: []
  },
  features: {
    type: [String],
    default: []
  },
  rating: {
    type: Number,
    default: 4.0,
    min: 0,
    max: 5
  },
  view: {
    type: String,
    enum: ['City View', 'Ocean View', 'Garden View', 'Mountain View', 'Pool View', 'Street View'],
    default: 'City View'
  },
  available: {
    type: Boolean,
    default: true
  },
  outOfOrder: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Room', roomSchema);
