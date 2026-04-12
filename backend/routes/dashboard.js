const express = require('express');
const {
  getPatientDashboard,
  getDoctorDashboard,
  getAdminDashboard
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/dashboard/patient
 * @desc    Get patient dashboard with appointments & medical records
 * @access  Private (Patient)
 */
router.get('/patient', protect, getPatientDashboard);

/**
 * @route   GET /api/dashboard/doctor
 * @desc    Get doctor dashboard with appointments & queue status
 * @access  Private (Doctor)
 */
router.get('/doctor', protect, getDoctorDashboard);

/**
 * @route   GET /api/dashboard/admin
 * @desc    Get admin dashboard with system statistics
 * @access  Private (Admin)
 */
router.get('/admin', protect, getAdminDashboard);

module.exports = router;
