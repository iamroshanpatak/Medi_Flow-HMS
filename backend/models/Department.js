const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    description: String,
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    doctors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    location: {
      floor: String,
      wing: String,
      roomNumber: String,
    },
    workingHours: {
      weekdays: {
        start: String,
        end: String,
      },
      weekends: {
        start: String,
        end: String,
      },
    },
    services: [String],
    emergencyAvailable: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Department', departmentSchema);
