const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    recordType: {
      type: String,
      enum: ['general', 'laboratory', 'imaging', 'prescription'],
      default: 'general',
    },
    recordDate: {
      type: Date,
      default: Date.now,
    },
    // General health metrics
    vitalSigns: {
      temperature: Number, // Celsius
      bloodPressure: {
        systolic: Number,
        diastolic: Number,
      },
      heartRate: Number, // bpm
      respiratoryRate: Number, // breaths per minute
      oxygenSaturation: Number, // percentage
      weight: Number, // kg
      height: Number, // cm
      bmi: Number,
    },
    // Laboratory results
    laboratoryResults: [
      {
        testName: String,
        value: String,
        unit: String,
        normalRange: String,
        status: {
          type: String,
          enum: ['normal', 'abnormal', 'critical'],
          default: 'normal',
        },
        testDate: Date,
      },
    ],
    // Diagnosis and treatment
    diagnosis: {
      primary: String,
      secondary: [String],
      icd10Code: String,
    },
    symptoms: [String],
    prescription: [
      {
        medication: String,
        dosage: String,
        frequency: String,
        duration: String,
        instructions: String,
      },
    ],
    notes: String,
    attachments: [
      {
        fileName: String,
        fileType: String,
        fileUrl: String,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    riskAssessment: {
      overallHealthScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      recommendations: [String],
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

// Calculate BMI before saving
medicalRecordSchema.pre('save', function (next) {
  if (this.vitalSigns && this.vitalSigns.weight && this.vitalSigns.height) {
    const heightInMeters = this.vitalSigns.height / 100;
    this.vitalSigns.bmi = (this.vitalSigns.weight / (heightInMeters * heightInMeters)).toFixed(2);
  }
  next();
});

// Index for faster queries
medicalRecordSchema.index({ patient: 1, recordDate: -1 });
medicalRecordSchema.index({ doctor: 1, recordDate: -1 });
medicalRecordSchema.index({ recordType: 1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
