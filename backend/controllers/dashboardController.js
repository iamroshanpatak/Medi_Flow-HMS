const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Queue = require('../models/Queue');
const MedicalRecord = require('../models/MedicalRecord');

/**
 * Get patient dashboard statistics
 * Shows: upcoming appointments, recent medical records, queue status
 */
exports.getPatientDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get upcoming appointments (next 7 days)
    const upcomingAppointments = await Appointment.find({
      patientId: userId,
      appointmentDate: { $gte: today },
      status: { $in: ['scheduled', 'confirmed'] }
    })
      .populate('doctorId', 'firstName lastName specialization')
      .populate('departmentId', 'departmentName')
      .sort({ appointmentDate: 1 })
      .limit(5)
      .lean();

    // Get recent appointments (completed)
    const recentAppointments = await Appointment.find({
      patientId: userId,
      status: 'completed'
    })
      .populate('doctorId', 'firstName lastName specialization')
      .sort({ appointmentDate: -1 })
      .limit(3)
      .lean();

    // Get recent medical records
    const recentMedicalRecords = await MedicalRecord.find({
      patientId: userId
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Count pending appointments
    const pendingCount = await Appointment.countDocuments({
      patientId: userId,
      status: 'scheduled'
    });

    // Count completed appointments (this month)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const completedThisMonth = await Appointment.countDocuments({
      patientId: userId,
      status: 'completed',
      appointmentDate: { $gte: startOfMonth }
    });

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          pendingAppointments: pendingCount,
          completedThisMonth,
          totalMedicalRecords: await MedicalRecord.countDocuments({ patientId: userId })
        },
        upcomingAppointments,
        recentAppointments,
        recentMedicalRecords
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get doctor dashboard statistics
 * Shows: today's appointments, queue status, patient analytics
 */
exports.getDoctorDashboard = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's appointments
    const todayAppointments = await Appointment.find({
      doctorId,
      appointmentDate: { $gte: today, $lt: tomorrow },
      status: { $in: ['scheduled', 'confirmed', 'in-progress'] }
    })
      .populate('patientId', 'firstName lastName email phone')
      .sort({ startTime: 1 })
      .lean();

    // Get queue status
    const queueStatus = await Queue.findOne({ doctorId }).lean();

    // Count completed appointments (today)
    const completedToday = await Appointment.countDocuments({
      doctorId,
      status: 'completed',
      appointmentDate: { $gte: today, $lt: tomorrow }
    });

    // Get week's appointments
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    
    const weekAppointments = await Appointment.find({
      doctorId,
      appointmentDate: { $gte: today, $lt: endOfWeek },
      status: { $in: ['scheduled', 'confirmed'] }
    })
      .countDocuments();

    // Average appointment duration this month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthAppointments = await Appointment.find({
      doctorId,
      status: 'completed',
      appointmentDate: { $gte: startOfMonth }
    })
      .select('startTime endTime')
      .lean();

    const avgDuration = monthAppointments.length > 0
      ? monthAppointments.reduce((sum, apt) => {
          const start = new Date(apt.startTime);
          const end = new Date(apt.endTime);
          return sum + (end - start) / 60000; // convert to minutes
        }, 0) / monthAppointments.length
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          appointmentsToday: todayAppointments.length,
          completedToday,
          appointmentsThisWeek: weekAppointments,
          averageAppointmentDuration: Math.round(avgDuration),
          queueWaitTime: queueStatus?.estimatedWaitTime || 0,
          totalPatientsServed: await Appointment.countDocuments({ doctorId, status: 'completed' })
        },
        todayAppointments,
        queueStatus
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get admin dashboard with system statistics
 */
exports.getAdminDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total users
    const totalUsers = await User.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });

    // Appointments statistics
    const totalAppointments = await Appointment.countDocuments();
    const appointmentsByStatus = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Today's appointments
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const appointmentsToday = await Appointment.countDocuments({
      appointmentDate: { $gte: today, $lt: tomorrow }
    });

    // Medical records statistics
    const totalMedicalRecords = await MedicalRecord.countDocuments();

    // Queue statistics
    const queues = await Queue.find().lean();
    const totalPatientsinQueues = queues.reduce((sum, q) => sum + (q.patientQueue?.length || 0), 0);

    // Recent activities
    const recentAppointments = await Appointment.find()
      .populate('patientId', 'firstName lastName')
      .populate('doctorId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        userStats: {
          totalUsers,
          totalPatients,
          totalDoctors,
          admins: totalUsers - totalPatients - totalDoctors
        },
        appointmentStats: {
          total: totalAppointments,
          today: appointmentsToday,
          byStatus: appointmentsByStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        },
        medicalRecords: {
          total: totalMedicalRecords
        },
        queueStats: {
          totalQueues: queues.length,
          patientsWaiting: totalPatientsinQueues
        },
        recentAppointments
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
