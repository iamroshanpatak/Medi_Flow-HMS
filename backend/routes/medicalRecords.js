const express = require('express');
const router = express.Router();
const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/medical-records
// @desc    Get all medical records (filtered by role)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { recordType, startDate, endDate, patientId } = req.query;
    let query = {};

    // Role-based filtering
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      if (patientId) {
        query.patient = patientId;
      } else {
        query.doctor = req.user._id;
      }
    }
    // Admin and staff can see all records

    // Additional filters
    if (recordType) {
      query.recordType = recordType;
    }

    if (startDate || endDate) {
      query.recordDate = {};
      if (startDate) query.recordDate.$gte = new Date(startDate);
      if (endDate) query.recordDate.$lte = new Date(endDate);
    }

    const records = await MedicalRecord.find(query)
      .populate('patient', 'firstName lastName email dateOfBirth gender bloodGroup')
      .populate('doctor', 'firstName lastName specialization')
      .sort({ recordDate: -1 });

    res.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching medical records',
      error: error.message,
    });
  }
});

// @route   GET /api/medical-records/:id
// @desc    Get single medical record
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('patient', 'firstName lastName email dateOfBirth gender bloodGroup phone address')
      .populate('doctor', 'firstName lastName specialization qualification');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found',
      });
    }

    // Check authorization
    if (
      req.user.role === 'patient' &&
      record.patient._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this record',
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching medical record',
      error: error.message,
    });
  }
});

// @route   POST /api/medical-records
// @desc    Create new medical record
// @access  Private (Doctor, Admin, Staff)
router.post('/', protect, authorize('doctor', 'admin', 'staff'), async (req, res) => {
  try {
    const recordData = {
      ...req.body,
      doctor: req.user._id,
    };

    // Validate patient exists
    const patient = await User.findById(recordData.patient);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    const record = await MedicalRecord.create(recordData);
    const populatedRecord = await MedicalRecord.findById(record._id)
      .populate('patient', 'firstName lastName email')
      .populate('doctor', 'firstName lastName specialization');

    res.status(201).json({
      success: true,
      data: populatedRecord,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating medical record',
      error: error.message,
    });
  }
});

// @route   PUT /api/medical-records/:id
// @desc    Update medical record
// @access  Private (Doctor, Admin)
router.put('/:id', protect, authorize('doctor', 'admin'), async (req, res) => {
  try {
    let record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found',
      });
    }

    // Check if doctor owns the record
    if (req.user.role === 'doctor' && record.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this record',
      });
    }

    record = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('patient', 'firstName lastName email')
      .populate('doctor', 'firstName lastName specialization');

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating medical record',
      error: error.message,
    });
  }
});

// @route   DELETE /api/medical-records/:id
// @desc    Delete medical record
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found',
      });
    }

    await record.deleteOne();

    res.json({
      success: true,
      message: 'Medical record deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting medical record',
      error: error.message,
    });
  }
});

// @route   GET /api/medical-records/patient/:patientId/summary
// @desc    Get patient health summary
// @access  Private (Doctor, Admin, Staff, or own patient)
router.get('/patient/:patientId/summary', protect, async (req, res) => {
  try {
    const { patientId } = req.params;

    // Check authorization
    if (
      req.user.role === 'patient' &&
      patientId !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this summary',
      });
    }

    const records = await MedicalRecord.find({ patient: patientId })
      .sort({ recordDate: -1 })
      .limit(10);

    const latestRecord = records[0];
    const latestVitals = records.find((r) => r.vitalSigns)?.vitalSigns;

    const summary = {
      totalRecords: await MedicalRecord.countDocuments({ patient: patientId }),
      latestRecordDate: latestRecord?.recordDate,
      latestVitals,
      recentDiagnoses: records
        .filter((r) => r.diagnosis?.primary)
        .slice(0, 5)
        .map((r) => ({
          diagnosis: r.diagnosis.primary,
          date: r.recordDate,
        })),
      activePrescriptions: records
        .flatMap((r) => r.prescription)
        .filter((p) => p)
        .slice(0, 5),
      recommendations: latestRecord?.riskAssessment?.recommendations || [],
    };

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching patient summary',
      error: error.message,
    });
  }
});

module.exports = router;
