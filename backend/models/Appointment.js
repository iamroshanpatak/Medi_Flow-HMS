const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
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
    department: {
      type: String,
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    // Stored as simple strings to match API/routes/frontend usage
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    // Backward-compatible: DB field is `appointmentType`, but code can set/read via `type`
    appointmentType: {
      type: String,
      enum: ['consultation', 'follow-up', 'emergency', 'routine-checkup'],
      default: 'consultation',
      alias: 'type',
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled'],
      default: 'scheduled',
    },
    reason: {
      type: String,
      required: true,
    },
    symptoms: [String],
    notes: String,
    diagnosis: String,
    prescription: {
      medications: [
        {
          name: String,
          dosage: String,
          frequency: String,
          duration: String,
        },
      ],
      instructions: String,
      diagnosis: String,
    },
    payment: {
      amount: Number,
      status: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending',
      },
      method: String,
      transactionId: String,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancellationReason: String,
    cancelledAt: Date,
    rescheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rescheduledReason: String,
    rescheduledAt: Date,
    previousDate: Date,
    previousStartTime: String,
    previousEndTime: String,
    reminderSent: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: String,
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ doctor: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
