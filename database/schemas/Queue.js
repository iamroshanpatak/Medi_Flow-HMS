const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    tokenNumber: {
      type: String,
      required: true,
      unique: true,
    },
    department: {
      type: String,
      required: true,
    },
    visitType: {
      type: String,
      enum: ['appointment', 'walk-in', 'emergency'],
      default: 'walk-in',
    },
    status: {
      type: String,
      enum: ['waiting', 'in-consultation', 'completed', 'cancelled', 'no-show'],
      default: 'waiting',
    },
    priority: {
      type: String,
      enum: ['normal', 'high', 'emergency'],
      default: 'normal',
    },
    estimatedWaitTime: {
      type: Number, // in minutes
    },
    position: {
      type: Number,
    },
    checkedInAt: {
      type: Date,
      default: Date.now,
    },
    calledAt: Date,
    consultationStartedAt: Date,
    consultationEndedAt: Date,
    averageConsultationTime: {
      type: Number, // in minutes
      default: 15,
    },
    symptoms: String,
    notes: String,
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Generate token number
queueSchema.pre('save', async function (next) {
  if (!this.tokenNumber) {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      },
    });
    this.tokenNumber = `${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Index for faster queries
queueSchema.index({ doctor: 1, status: 1, createdAt: -1 });
queueSchema.index({ patient: 1, status: 1 });

module.exports = mongoose.model('Queue', queueSchema);
