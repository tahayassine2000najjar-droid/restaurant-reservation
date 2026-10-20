

const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'customerName is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'phone is required'],
      trim: true,
    },
    phoneDigits: {
      type: String,
      default: null,
      index: true,
    },
    bookingCode: {
      type: String,
      default: null,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      default: null, 
    },
    date: {
      type: String, 
      required: [true, 'date is required'],
    },
    time: {
      type: String, 
      required: [true, 'time is required'],
    },
    guests: {
      type: Number,
      required: [true, 'guests is required'],
      min: [1, 'guests must be at least 1'],
      max: [20, 'guests must be at most 20'],
    },
    notes: {
      type: String,
      default: null, 
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true, 
  }
);


module.exports = mongoose.model('Reservation', reservationSchema);
