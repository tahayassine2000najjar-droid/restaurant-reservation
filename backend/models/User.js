// models/User.js - a member of the restaurant team (admin or reception).
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'username is required'],
      unique: true,
      trim: true,
    },
    // select:false keeps the password out of normal queries (we add it back to login)
    password: {
      type: String,
      required: [true, 'password is required'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'reception'],
      default: 'reception',
    },
  },
  {
    timestamps: true,
  }
);

// Hash the password automatically before saving (only when it changed)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('User', userSchema);
