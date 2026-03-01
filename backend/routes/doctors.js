const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/doctors
// @desc    Get all doctors
// @access  Public
router.get('/', async (req, res) => {
  try {
    let query = { role: 'doctor', isActive: true };

    // Filter by specialization
    if (req.query.specialization) {
      query.specialization = req.query.specialization;
    }

    // Filter by department
    if (req.query.department) {
      query.department = req.query.department;
    }

    const doctors = await User.find(query).select(
      'firstName lastName email specialization qualification experience consultationFee department profileImage availability'
    );

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/doctors/:id
// @desc    Get single doctor
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id).select(
      'firstName lastName email phone specialization qualification experience consultationFee department profileImage availability'
    );

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/doctors/:id/availability
// @desc    Get doctor's availability for a specific date
// @access  Public
router.get('/:id/availability', async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a date',
      });
    }

    const doctor = await User.findById(req.params.id);

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    const requestedDate = new Date(date);
    const dayName = requestedDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Get doctor's availability for this day
    const dayAvailability = doctor.availability?.find(
      (avail) => avail.day === dayName
    );

    if (!dayAvailability || !dayAvailability.slots || dayAvailability.slots.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          date,
          day: dayName,
          availableSlots: [],
          message: 'Doctor is not available on this day',
        },
      });
    }

    // Get all booked appointments for this date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      doctor: req.params.id,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['scheduled', 'confirmed'] },
    }).select('startTime endTime');

    // Filter out booked slots
    const availableSlots = dayAvailability.slots.filter((slot) => {
      if (!slot.isAvailable) return false;

      // Check if this slot conflicts with any booked appointment
      const isBooked = bookedAppointments.some((appointment) => {
        return (
          (slot.startTime < appointment.endTime && slot.endTime > appointment.startTime)
        );
      });

      return !isBooked;
    });

    res.status(200).json({
      success: true,
      data: {
        date,
        day: dayName,
        availableSlots,
        bookedSlots: bookedAppointments.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/doctors/:id/availability
// @desc    Update doctor's availability
// @access  Private (Doctor - own profile, Admin)
router.put('/:id/availability', protect, async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id);

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this doctor\'s availability',
      });
    }

    doctor.availability = req.body.availability;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: doctor.availability,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/doctors/:id/appointments
// @desc    Get doctor's appointments
// @access  Private (Doctor - own appointments, Admin)
router.get('/:id/appointments', protect, async (req, res) => {
  try {
    // Check authorization
    if (req.user.role !== 'admin' && req.user.role !== 'staff' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these appointments',
      });
    }

    let query = { doctor: req.params.id };

    // Filter by date
    if (req.query.date) {
      const startDate = new Date(req.query.date);
      const endDate = new Date(req.query.date);
      endDate.setDate(endDate.getDate() + 1);
      query.appointmentDate = { $gte: startDate, $lt: endDate };
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName email phone dateOfBirth gender')
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

// @route   GET /api/doctors/specializations
// @desc    Get all unique specializations
// @access  Public
router.get('/meta/specializations', async (req, res) => {
  try {
    const specializations = await User.distinct('specialization', {
      role: 'doctor',
      isActive: true,
    });

    res.status(200).json({
      success: true,
      data: specializations.filter(Boolean),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
