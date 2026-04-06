const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Queue = require('../models/Queue');
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

// @route   GET /api/doctors/meta/specializations
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

// @route   GET /api/doctors/:id/patients
// @desc    Get list of patients treated by doctor
// @access  Private (Doctor - own patients, Admin)
router.get('/:id/patients', protect, async (req, res) => {
  try {
    // Check authorization
    if (req.user.role !== 'admin' && req.user.role !== 'staff' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this information',
      });
    }

    // Get all unique patients who have had appointments with this doctor
    const patients = await Appointment.find({ doctor: req.params.id })
      .distinct('patient');

    // Fetch patient details
    const patientDetails = await User.find({
      _id: { $in: patients },
      role: 'patient'
    }).select('firstName lastName email phone dateOfBirth gender bloodGroup');

    res.status(200).json({
      success: true,
      count: patientDetails.length,
      data: patientDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/doctors/:id/analytics
// @desc    Get doctor's performance analytics
// @access  Private (Doctor - own analytics, Admin)
router.get('/:id/analytics', protect, async (req, res) => {
  try {
    // Check authorization
    if (req.user.role !== 'admin' && req.user.role !== 'staff' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access analytics',
      });
    }

    const doctorId = req.params.id;

    // Calculate date ranges
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    // Get total appointments (all time)
    const totalAppointments = await Appointment.countDocuments({ doctor: doctorId });

    // Get completed appointments (all time)
    const completedAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      status: 'completed'
    });

    // Get appointments this month
    const appointmentsThisMonth = await Appointment.countDocuments({
      doctor: doctorId,
      appointmentDate: { $gte: startOfMonth }
    });

    // Get completed appointments this month
    const completedThisMonth = await Appointment.countDocuments({
      doctor: doctorId,
      status: 'completed',
      appointmentDate: { $gte: startOfMonth }
    });

    // Get cancelled appointments this month
    const cancelledThisMonth = await Appointment.countDocuments({
      doctor: doctorId,
      status: 'cancelled',
      appointmentDate: { $gte: startOfMonth }
    });

    // Get unique patients count
    const uniquePatients = await Appointment.find({ doctor: doctorId })
      .distinct('patient');

    // Get average rating
    const ratings = await Appointment.find({
      doctor: doctorId,
      rating: { $exists: true, $ne: null }
    }).select('rating');

    const averageRating = ratings.length > 0
      ? (ratings.reduce((sum, apt) => sum + apt.rating, 0) / ratings.length).toFixed(2)
      : 0;

    // Get queue statistics for today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayQueue = await Queue.find({
      doctor: doctorId,
      checkInTime: { $gte: todayStart, $lte: todayEnd }
    });

    const completedToday = todayQueue.filter(q => q.status === 'completed').length;
    const waitingToday = todayQueue.filter(q => q.status === 'waiting').length;

    // Calculate average consultation time
    const consultations = await Appointment.find({
      doctor: doctorId,
      status: 'completed',
      startTime: { $exists: true },
      endTime: { $exists: true }
    }).select('startTime endTime');

    let averageConsultationMinutes = 0;
    if (consultations.length > 0) {
      const totalMinutes = consultations.reduce((sum, apt) => {
        const start = new Date(`2000-01-01T${apt.startTime}`);
        const end = new Date(`2000-01-01T${apt.endTime}`);
        return sum + ((end - start) / 60000);
      }, 0);
      averageConsultationMinutes = Math.round(totalMinutes / consultations.length);
    }

    // No-show rate
    const noShows = await Appointment.countDocuments({
      doctor: doctorId,
      status: 'no-show'
    });

    const noShowRate = totalAppointments > 0
      ? ((noShows / totalAppointments) * 100).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        allTime: {
          totalAppointments,
          completedAppointments,
          completionRate: totalAppointments > 0
            ? ((completedAppointments / totalAppointments) * 100).toFixed(2)
            : 0,
          uniquePatients: uniquePatients.length,
          averageRating: parseFloat(averageRating),
          noShowRate: parseFloat(noShowRate),
        },
        thisMonth: {
          appointments: appointmentsThisMonth,
          completed: completedThisMonth,
          cancelled: cancelledThisMonth,
          completionRate: appointmentsThisMonth > 0
            ? ((completedThisMonth / appointmentsThisMonth) * 100).toFixed(2)
            : 0,
        },
        today: {
          completed: completedToday,
          waiting: waitingToday,
          totalToday: todayQueue.length,
        },
        performance: {
          averageConsultationMinutes,
          averageRating: parseFloat(averageRating),
          noShowRate: parseFloat(noShowRate),
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/doctors/:id/queue-stats
// @desc    Get doctor's queue statistics
// @access  Private (Doctor - own stats, Admin)
router.get('/:id/queue-stats', protect, async (req, res) => {
  try {
    // Check authorization
    if (req.user.role !== 'admin' && req.user.role !== 'staff' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const doctorId = req.params.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total queue entries today
    const totalQueue = await Queue.countDocuments({
      doctor: doctorId,
      checkInTime: { $gte: today }
    });

    // Completed today
    const completed = await Queue.countDocuments({
      doctor: doctorId,
      status: 'completed',
      checkInTime: { $gte: today }
    });

    // Currently waiting
    const waiting = await Queue.countDocuments({
      doctor: doctorId,
      status: 'waiting',
      checkInTime: { $gte: today }
    });

    // No-shows today
    const noShows = await Queue.countDocuments({
      doctor: doctorId,
      status: 'no-show',
      checkInTime: { $gte: today }
    });

    // Calculate average wait time
    const queueEntries = await Queue.find({
      doctor: doctorId,
      checkInTime: { $gte: today }
    }).select('checkInTime estimatedWaitTime');

    const avgWaitTime = queueEntries.length > 0
      ? Math.round(queueEntries.reduce((sum, q) => sum + q.estimatedWaitTime, 0) / queueEntries.length)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        today: {
          total: totalQueue,
          completed,
          waiting,
          noShows,
          averageWaitTimeMinutes: avgWaitTime,
          completionRate: totalQueue > 0 ? ((completed / totalQueue) * 100).toFixed(2) : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
