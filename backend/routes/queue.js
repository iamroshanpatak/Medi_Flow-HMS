const express = require('express');
const router = express.Router();
const Queue = require('../models/Queue');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/queue
// @desc    Get all queue entries (filtered by role)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    // Patients can only see their own queue entries
    if (req.user.role === 'patient') {
      query.patient = req.user.id;
    }
    // Doctors can only see their queue
    else if (req.user.role === 'doctor') {
      query.doctor = req.user.id;
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by date
    if (req.query.date) {
      const startDate = new Date(req.query.date);
      const endDate = new Date(req.query.date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    } else {
      // Default to today's queue
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      query.date = { $gte: today, $lt: tomorrow };
    }

    const queueEntries = await Queue.find(query)
      .populate('patient', 'firstName lastName phone')
      .populate('doctor', 'firstName lastName specialization')
      .populate('appointment')
      .sort({ tokenNumber: 1 });

    res.status(200).json({
      success: true,
      count: queueEntries.length,
      data: queueEntries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/queue/:id
// @desc    Get single queue entry
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const queueEntry = await Queue.findById(req.params.id)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization')
      .populate('appointment');

    if (!queueEntry) {
      return res.status(404).json({
        success: false,
        message: 'Queue entry not found',
      });
    }

    // Check authorization
    if (
      req.user.role === 'patient' &&
      queueEntry.patient._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this queue entry',
      });
    }

    res.status(200).json({
      success: true,
      data: queueEntry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/queue/check-in
// @desc    Check in for appointment (generate token)
// @access  Private (Patient)
router.post('/check-in', protect, authorize('patient'), async (req, res) => {
  try {
    const { appointmentId } = req.body;

    // Validate appointment
    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check if appointment belongs to user
    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to check in for this appointment',
      });
    }

    // Check if appointment is today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(appointment.appointmentDate);
    appointmentDate.setHours(0, 0, 0, 0);

    if (appointmentDate.getTime() !== today.getTime()) {
      return res.status(400).json({
        success: false,
        message: 'Can only check in on the day of appointment',
      });
    }

    // Check if already checked in
    const existingQueue = await Queue.findOne({
      appointment: appointmentId,
      date: { $gte: today },
      status: { $nin: ['completed', 'cancelled'] },
    });

    if (existingQueue) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in',
        data: existingQueue,
      });
    }

    // Generate token number
    const lastToken = await Queue.findOne({
      doctor: appointment.doctor,
      date: { $gte: today },
    }).sort({ tokenNumber: -1 });

    const tokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1;

    // Calculate position and estimated wait time
    const queueAhead = await Queue.countDocuments({
      doctor: appointment.doctor,
      date: { $gte: today },
      status: { $in: ['waiting', 'in-progress'] },
    });

    const avgConsultationTime = 15; // minutes
    const estimatedWaitTime = queueAhead * avgConsultationTime;

    // Create queue entry
    const queueEntry = await Queue.create({
      patient: req.user.id,
      doctor: appointment.doctor,
      appointment: appointmentId,
      tokenNumber,
      date: new Date(),
      type: 'appointment',
      status: 'waiting',
      position: queueAhead + 1,
      estimatedWaitTime,
      checkInTime: new Date(),
    });

    const populatedEntry = await Queue.findById(queueEntry._id)
      .populate('patient', 'firstName lastName phone')
      .populate('doctor', 'firstName lastName specialization')
      .populate('appointment');

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`doctor-${appointment.doctor}`).emit('queueUpdate', {
      action: 'check-in',
      data: populatedEntry,
    });

    res.status(201).json({
      success: true,
      message: 'Checked in successfully',
      data: populatedEntry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/queue/walk-in
// @desc    Create walk-in queue entry
// @access  Private (Staff, Admin)
router.post('/walk-in', protect, authorize('staff', 'admin'), async (req, res) => {
  try {
    const { patientId, doctorId, reason } = req.body;

    // Validate patient and doctor
    const patient = await User.findById(patientId);
    const doctor = await User.findById(doctorId);

    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    // Generate token number
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastToken = await Queue.findOne({
      doctor: doctorId,
      date: { $gte: today },
    }).sort({ tokenNumber: -1 });

    const tokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1;

    // Calculate position
    const queueAhead = await Queue.countDocuments({
      doctor: doctorId,
      date: { $gte: today },
      status: { $in: ['waiting', 'in-progress'] },
    });

    const avgConsultationTime = 15;
    const estimatedWaitTime = queueAhead * avgConsultationTime;

    // Create queue entry
    const queueEntry = await Queue.create({
      patient: patientId,
      doctor: doctorId,
      tokenNumber,
      date: new Date(),
      type: 'walk-in',
      status: 'waiting',
      position: queueAhead + 1,
      estimatedWaitTime,
      checkInTime: new Date(),
      reason: reason || 'Walk-in consultation',
    });

    const populatedEntry = await Queue.findById(queueEntry._id)
      .populate('patient', 'firstName lastName phone')
      .populate('doctor', 'firstName lastName specialization');

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`doctor-${doctorId}`).emit('queueUpdate', {
      action: 'walk-in',
      data: populatedEntry,
    });

    res.status(201).json({
      success: true,
      data: populatedEntry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/queue/:id/call-next
// @desc    Call next patient
// @access  Private (Doctor, Staff)
router.put('/:id/call-next', protect, authorize('doctor', 'staff', 'admin'), async (req, res) => {
  try {
    const queueEntry = await Queue.findById(req.params.id);

    if (!queueEntry) {
      return res.status(404).json({
        success: false,
        message: 'Queue entry not found',
      });
    }

    // Doctors can only call their own patients
    if (req.user.role === 'doctor' && queueEntry.doctor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    queueEntry.status = 'in-progress';
    queueEntry.consultationStartTime = new Date();
    await queueEntry.save();

    const populatedEntry = await Queue.findById(queueEntry._id)
      .populate('patient', 'firstName lastName phone')
      .populate('doctor', 'firstName lastName specialization');

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`doctor-${queueEntry.doctor}`).emit('queueUpdate', {
      action: 'call-next',
      data: populatedEntry,
    });
    io.to(`patient-${queueEntry.patient}`).emit('patientCalled', {
      data: populatedEntry,
    });

    res.status(200).json({
      success: true,
      data: populatedEntry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/queue/:id/complete
// @desc    Mark queue entry as completed
// @access  Private (Doctor, Staff)
router.put('/:id/complete', protect, authorize('doctor', 'staff', 'admin'), async (req, res) => {
  try {
    const queueEntry = await Queue.findById(req.params.id);

    if (!queueEntry) {
      return res.status(404).json({
        success: false,
        message: 'Queue entry not found',
      });
    }

    if (req.user.role === 'doctor' && queueEntry.doctor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    queueEntry.status = 'completed';
    queueEntry.consultationEndTime = new Date();
    await queueEntry.save();

    // Update appointment if exists
    if (queueEntry.appointment) {
      await Appointment.findByIdAndUpdate(queueEntry.appointment, {
        status: 'completed',
      });
    }

    // Update positions for remaining queue
    await updateQueuePositions(queueEntry.doctor);

    const populatedEntry = await Queue.findById(queueEntry._id)
      .populate('patient', 'firstName lastName phone')
      .populate('doctor', 'firstName lastName specialization');

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`doctor-${queueEntry.doctor}`).emit('queueUpdate', {
      action: 'complete',
      data: populatedEntry,
    });

    res.status(200).json({
      success: true,
      data: populatedEntry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/queue/status/patient
// @desc    Get patient's current queue status
// @access  Private (Patient)
router.get('/status/patient', protect, authorize('patient'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const queueEntry = await Queue.findOne({
      patient: req.user.id,
      date: { $gte: today },
      status: { $in: ['waiting', 'in-progress'] },
    })
      .populate('doctor', 'firstName lastName specialization')
      .populate('appointment');

    if (!queueEntry) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'Not in queue',
      });
    }

    // Calculate current position
    const position = await Queue.countDocuments({
      doctor: queueEntry.doctor._id,
      date: { $gte: today },
      status: 'waiting',
      tokenNumber: { $lt: queueEntry.tokenNumber },
    }) + 1;

    queueEntry.position = position;
    await queueEntry.save();

    res.status(200).json({
      success: true,
      data: queueEntry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Helper function to update queue positions
async function updateQueuePositions(doctorId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const waitingEntries = await Queue.find({
    doctor: doctorId,
    date: { $gte: today },
    status: 'waiting',
  }).sort({ tokenNumber: 1 });

  for (let i = 0; i < waitingEntries.length; i++) {
    waitingEntries[i].position = i + 1;
    waitingEntries[i].estimatedWaitTime = i * 15; // 15 minutes per patient
    await waitingEntries[i].save();
  }
}

module.exports = router;
