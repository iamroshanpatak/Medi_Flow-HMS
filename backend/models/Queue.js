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
      type: Number,
      required: true,
    },
    // Queue date (used heavily in queries)
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    // Matches frontend/routes naming
    type: {
      type: String,
      enum: ['appointment', 'walk-in', 'emergency'],
      default: 'walk-in',
    },
    // Optional metadata
    department: {
      type: String,
    },
    status: {
      type: String,
      enum: ['waiting', 'in-progress', 'in-consultation', 'completed', 'cancelled', 'no-show'],
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
    checkInTime: {
      type: Date,
      default: Date.now,
    },
    calledAt: Date,
    consultationStartTime: Date,
    consultationEndTime: Date,
    averageConsultationTime: {
      type: Number, // in minutes
      default: 15,
    },
    reason: String,
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

// Generate token number (per doctor, per day) if not provided
queueSchema.pre('save', async function (next) {
  if (!this.tokenNumber) {
    const baseDate = this.date ? new Date(this.date) : new Date();
    const startOfDay = new Date(baseDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(baseDate);
    endOfDay.setHours(23, 59, 59, 999);

    const last = await this.constructor
      .findOne({
        doctor: this.doctor,
        date: { $gte: startOfDay, $lte: endOfDay },
      })
      .sort({ tokenNumber: -1 })
      .select('tokenNumber');

    this.tokenNumber = last?.tokenNumber ? last.tokenNumber + 1 : 1;
  }
  next();
});

// Index for faster queries
queueSchema.index({ doctor: 1, status: 1, createdAt: -1 });
queueSchema.index({ patient: 1, status: 1 });
queueSchema.index({ doctor: 1, date: 1, tokenNumber: 1 }, { unique: false });

module.exports = mongoose.model('Queue', queueSchema);
