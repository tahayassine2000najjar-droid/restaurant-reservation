

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
    // The phone with only the digits ("+1 555 123 4567" -> "15551234567").
    // The guest uses his phone to find "his" reservations, on any device.
    phoneDigits: {
      type: String,
      default: null,
      index: true,
    },
    // Short code given to the guest at creation (example: R-7K2QM),
    // like a ticket number: he keeps it to find or cancel his request.
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
