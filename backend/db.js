

const mongoose = require('mongoose');


const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/restaurant_reservations';


async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`MongoDB connected: ${MONGO_URI}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.error('Make sure MongoDB is running (MongoDB Compass can confirm).');
    process.exit(1);
  }
}

module.exports = connectDB;
