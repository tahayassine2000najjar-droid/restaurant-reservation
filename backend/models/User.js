
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


userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('User', userSchema);
