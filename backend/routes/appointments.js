const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const {
  sendAppointmentConfirmation,
  sendAppointmentCancellation,
  sendAppointmentReschedule,
} = require('../utils/emailService');
const {
  sendAppointmentConfirmationSMS,
  sendAppointmentCancellationSMS,
  sendAppointmentRescheduleSMS,
} = require('../utils/smsService');
const cronService = require('../utils/cronService');

// @route   GET /api/appointments
// @desc    Get all appointments (filtered by role)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query;

    // Patients can only see their own appointments
    if (req.user.role === 'patient') {
      query = { patient: req.user.id };
    }
    // Doctors can only see their own appointments
    else if (req.user.role === 'doctor') {
      query = { doctor: req.user.id };
    }
    // Admin and staff can see all appointments
    else {
      query = {};
    }

    // Apply filters from query params
    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.date) {
      const startDate = new Date(req.query.date);
      const endDate = new Date(req.query.date);
      endDate.setDate(endDate.getDate() + 1);
      query.appointmentDate = { $gte: startDate, $lt: endDate };
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization')
      .sort({ appointmentDate: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get single appointment
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'firstName lastName email phone dateOfBirth gender')
      .populate('doctor', 'firstName lastName specialization consultationFee');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check authorization
    if (
      req.user.role === 'patient' &&
      appointment.patient._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this appointment',
      });
    }

    if (
      req.user.role === 'doctor' &&
      appointment.doctor._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this appointment',
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/appointments
// @desc    Create new appointment
// @access  Private (Patient)
router.post('/', protect, authorize('patient'), async (req, res) => {
  try {
    const { doctor, department, appointmentDate, startTime, endTime, reason, type } = req.body;

    // Validate doctor exists
    const doctorExists = await User.findById(doctor);
    if (!doctorExists || doctorExists.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    // Check if doctor is available at this time
    const conflictingAppointment = await Appointment.findOne({
      doctor,
      appointmentDate: new Date(appointmentDate),
      status: { $in: ['scheduled', 'confirmed'] },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      ],
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked',
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor,
      department: department || 'General Medicine',
      appointmentDate: new Date(appointmentDate),
      startTime,
      endTime,
      reason,
      type: type || 'consultation',
      status: 'scheduled',
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization');

    // Send confirmation email
    await sendAppointmentConfirmation({
      patientEmail: populatedAppointment.patient.email,
      patientName: `${populatedAppointment.patient.firstName} ${populatedAppointment.patient.lastName}`,
      doctorName: `${populatedAppointment.doctor.firstName} ${populatedAppointment.doctor.lastName}`,
      appointmentDate,
      startTime,
      endTime,
      reason,
    });

    // Send confirmation SMS
    await sendAppointmentConfirmationSMS({
      patientPhone: populatedAppointment.patient.phone,
      patientName: `${populatedAppointment.patient.firstName} ${populatedAppointment.patient.lastName}`,
      doctorName: `${populatedAppointment.doctor.firstName} ${populatedAppointment.doctor.lastName}`,
      appointmentDate,
      startTime,
      endTime,
    });

    res.status(201).json({
      success: true,
      data: populatedAppointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check authorization
    const isPatient = req.user.role === 'patient' && appointment.patient.toString() === req.user.id;
    const isDoctor = req.user.role === 'doctor' && appointment.doctor.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'staff';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment',
      });
    }

    // Update appointment
    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('patient', 'firstName lastName email phone')
     .populate('doctor', 'firstName lastName specialization');

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/appointments/:id/cancel
// @desc    Cancel appointment
// @access  Private (Patient, Doctor, Admin)
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check authorization
    const isPatient = req.user.role === 'patient' && appointment.patient.toString() === req.user.id;
    const isDoctor = req.user.role === 'doctor' && appointment.doctor.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'staff';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment',
      });
    }

    appointment.status = 'cancelled';
    appointment.cancelledBy = req.user.id;
    appointment.cancelledAt = Date.now();
    appointment.cancellationReason = req.body.reason;

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization');

    // Send cancellation email
    await sendAppointmentCancellation({
      patientEmail: populatedAppointment.patient.email,
      patientName: `${populatedAppointment.patient.firstName} ${populatedAppointment.patient.lastName}`,
      doctorName: `${populatedAppointment.doctor.firstName} ${populatedAppointment.doctor.lastName}`,
      appointmentDate: populatedAppointment.appointmentDate,
      startTime: populatedAppointment.startTime,
      cancellationReason: req.body.reason,
    });

    // Send cancellation SMS
    await sendAppointmentCancellationSMS({
      patientPhone: populatedAppointment.patient.phone,
      patientName: `${populatedAppointment.patient.firstName} ${populatedAppointment.patient.lastName}`,
      doctorName: `${populatedAppointment.doctor.firstName} ${populatedAppointment.doctor.lastName}`,
      appointmentDate: populatedAppointment.appointmentDate,
    });

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: populatedAppointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/appointments/:id/reschedule
// @desc    Reschedule appointment
// @access  Private (Patient, Doctor, Admin)
router.put('/:id/reschedule', protect, async (req, res) => {
  try {
    const { appointmentDate, startTime, endTime, reason } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check if appointment can be rescheduled
    if (appointment.status === 'cancelled' || appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot reschedule ${appointment.status} appointment`,
      });
    }

    // Check authorization
    const isPatient = req.user.role === 'patient' && appointment.patient.toString() === req.user.id;
    const isDoctor = req.user.role === 'doctor' && appointment.doctor.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'staff';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reschedule this appointment',
      });
    }

    // Check if doctor is available at the new time
    const conflictingAppointment = await Appointment.findOne({
      _id: { $ne: req.params.id },
      doctor: appointment.doctor,
      appointmentDate: new Date(appointmentDate),
      status: { $in: ['scheduled', 'confirmed'] },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      ],
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked',
      });
    }

    // Store old appointment details
    const oldDate = appointment.appointmentDate;
    const oldStartTime = appointment.startTime;
    const oldEndTime = appointment.endTime;

    // Update appointment
    appointment.appointmentDate = new Date(appointmentDate);
    appointment.startTime = startTime;
    appointment.endTime = endTime;
    appointment.status = 'rescheduled';
    appointment.rescheduledBy = req.user.id;
    appointment.rescheduledAt = Date.now();
    appointment.rescheduledReason = reason;
    appointment.previousDate = oldDate;
    appointment.previousStartTime = oldStartTime;
    appointment.previousEndTime = oldEndTime;

    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization email');

    // Send reschedule email
    await sendAppointmentReschedule({
      patientEmail: updatedAppointment.patient.email,
      patientName: `${updatedAppointment.patient.firstName} ${updatedAppointment.patient.lastName}`,
      doctorName: `${updatedAppointment.doctor.firstName} ${updatedAppointment.doctor.lastName}`,
      oldDate: oldDate,
      oldTime: oldStartTime,
      newDate: appointmentDate,
      newStartTime: startTime,
      newEndTime: endTime,
      reason: reason,
    });

    // Send reschedule SMS
    await sendAppointmentRescheduleSMS({
      patientPhone: updatedAppointment.patient.phone,
      patientName: `${updatedAppointment.patient.firstName} ${updatedAppointment.patient.lastName}`,
      doctorName: `${updatedAppointment.doctor.firstName} ${updatedAppointment.doctor.lastName}`,
      oldDate: oldDate,
      newDate: appointmentDate,
      newStartTime: startTime,
      newEndTime: endTime,
    });

    res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: updatedAppointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/appointments/:id/complete
// @desc    Mark appointment as completed
// @access  Private (Doctor, Admin)
router.put('/:id/complete', protect, authorize('doctor', 'admin', 'staff'), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Doctors can only complete their own appointments
    if (req.user.role === 'doctor' && appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this appointment',
      });
    }

    appointment.status = 'completed';
    appointment.completedAt = Date.now();

    // Add prescription and diagnosis if provided
    if (req.body.prescription) {
      appointment.prescription = req.body.prescription;
    }
    if (req.body.diagnosis) {
      appointment.diagnosis = req.body.diagnosis;
    }
    if (req.body.notes) {
      appointment.notes = req.body.notes;
    }

    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment completed successfully',
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Delete appointment
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    await appointment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/appointments/cron/trigger-reminders
// @desc    Manually trigger reminder check (Admin only)
// @access  Private (Admin)
router.post('/cron/trigger-reminders', protect, authorize('admin'), async (req, res) => {
  try {
    await cronService.triggerReminderCheck();

    res.status(200).json({
      success: true,
      message: 'Reminder check triggered successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/appointments/cron/status
// @desc    Get cron job status and statistics (Admin only)
// @access  Private (Admin)
router.get('/cron/status', protect, authorize('admin'), async (req, res) => {
  try {
    const cronStatus = await cronService.getCronStatus();

    res.status(200).json({
      success: true,
      data: cronStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
