/**
 * Cron Service - Scheduled Jobs for MediFlow
 * Handles all scheduled tasks including appointment reminders
 * FIXED: Added locking mechanism to prevent duplicate jobs on multiple instances
 */

const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const reminderService = require('./reminderService');

// Store job references for cleanup
let appointmentReminderJob = null;
let isLocked = false;

/**
 * Simple locking mechanism to ensure only one instance runs cron jobs
 * Uses environment variable to designate primary instance
 */
const canRunCronJobs = () => {
  // If CRON_INSTANCE env var is set, only run on that instance
  if (process.env.CRON_INSTANCE) {
    return process.env.CRON_INSTANCE === (process.env.HOSTNAME || 'local');
  }
  // Default: only run on instances where NODE_ENV is not 'production' 
  // OR set explicitly to run
  return process.env.RUN_CRON !== 'false';
};

/**
 * Initialize all cron jobs
 * Called once when server starts
 * FIXED: Only one instance should run cron jobs
 */
const initCronJobs = () => {
  console.log('🕐 Initializing cron jobs...');
  
  // CRITICAL FIX: Prevent duplicate cron jobs on multiple instances
  if (!canRunCronJobs()) {
    console.log('⏭️ Cron jobs disabled for this instance (set CRON_INSTANCE to enable)');
    return;
  }

  if (isLocked) {
    console.log('⚠️ Cron jobs already initialized');
    return;
  }
  
  try {
    isLocked = true;
    
    // Schedule appointment reminder checks
    // Run every 5 minutes to check for appointments needing reminders
    appointmentReminderJob = cron.schedule('*/5 * * * *', async () => {
      console.log('🔔 Running appointment reminder check...');
      await checkAndSendReminders();
    });

    console.log('✅ Cron jobs initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing cron jobs:', error);
    isLocked = false;
  }
};

/**
 * Check for upcoming appointments and send reminders
 * Sends reminders for: 24 hours before and 1 hour before
 */
const checkAndSendReminders = async () => {
  try {
    const now = new Date();

    // Check for 24-hour reminders
    await checkAndSend24HourReminders(now);

    // Check for 1-hour reminders
    await checkAndSend1HourReminders(now);

  } catch (error) {
    console.error('❌ Error in checkAndSendReminders:', error.message);
  }
};

/**
 * Send reminders for appointments in 24 hours
 * Checks appointments between 23.5 to 24.5 hours ahead
 */
const checkAndSend24HourReminders = async (now) => {
  try {
    // Time window: 23.5 to 24.5 hours from now
    const reminderMinTime = new Date(now.getTime() + 23.5 * 60 * 60 * 1000);
    const reminderMaxTime = new Date(now.getTime() + 24.5 * 60 * 60 * 1000);

    // Find appointments that need 24-hour reminders
    const appointments = await Appointment.find({
      appointmentDate: {
        $gte: reminderMinTime,
        $lte: reminderMaxTime,
      },
      status: { $in: ['scheduled', 'confirmed'] },
      reminder_24h_sent: false,
    })
      .populate('patient', 'firstName lastName phone email')
      .populate('doctor', 'firstName lastName phone specialization')
      .lean();

    if (appointments.length > 0) {
      console.log(`📨 Found ${appointments.length} appointment(s) for 24-hour reminder`);

      for (const appointment of appointments) {
        try {
          // Send SMS reminder
          await reminderService.sendAppointmentReminder(
            appointment,
            '24hour',
            'sms'
          );

          // Send Email reminder
          await reminderService.sendAppointmentReminder(
            appointment,
            '24hour',
            'email'
          );

          // Update appointment to mark reminder sent
          await Appointment.findByIdAndUpdate(
            appointment._id,
            {
              reminder_24h_sent: true,
              reminder_24h_sent_at: new Date(),
            },
            { new: true }
          );

          console.log(`✅ 24-hour reminder sent for appointment ${appointment._id}`);
        } catch (error) {
          console.error(
            `❌ Error sending 24-hour reminder for appointment ${appointment._id}:`,
            error.message
          );
        }
      }
    }
  } catch (error) {
    console.error('❌ Error in checkAndSend24HourReminders:', error.message);
  }
};

/**
 * Send reminders for appointments in 1 hour
 * Checks appointments between 0.9 to 1.1 hours ahead
 */
const checkAndSend1HourReminders = async (now) => {
  try {
    // Time window: 0.9 to 1.1 hours from now (54 to 66 minutes)
    const reminderMinTime = new Date(now.getTime() + 0.9 * 60 * 60 * 1000);
    const reminderMaxTime = new Date(now.getTime() + 1.1 * 60 * 60 * 1000);

    // Find appointments that need 1-hour reminders
    const appointments = await Appointment.find({
      appointmentDate: {
        $gte: reminderMinTime,
        $lte: reminderMaxTime,
      },
      status: { $in: ['scheduled', 'confirmed'] },
      reminder_1h_sent: false,
    })
      .populate('patient', 'firstName lastName phone email')
      .populate('doctor', 'firstName lastName phone specialization')
      .lean();

    if (appointments.length > 0) {
      console.log(`📨 Found ${appointments.length} appointment(s) for 1-hour reminder`);

      for (const appointment of appointments) {
        try {
          // Send SMS reminder
          await reminderService.sendAppointmentReminder(
            appointment,
            '1hour',
            'sms'
          );

          // Send Email reminder
          await reminderService.sendAppointmentReminder(
            appointment,
            '1hour',
            'email'
          );

          // Update appointment to mark reminder sent
          await Appointment.findByIdAndUpdate(
            appointment._id,
            {
              reminder_1h_sent: true,
              reminder_1h_sent_at: new Date(),
            },
            { new: true }
          );

          console.log(`✅ 1-hour reminder sent for appointment ${appointment._id}`);
        } catch (error) {
          console.error(
            `❌ Error sending 1-hour reminder for appointment ${appointment._id}:`,
            error.message
          );
        }
      }
    }
  } catch (error) {
    console.error('❌ Error in checkAndSend1HourReminders:', error.message);
  }
};

/**
 * Manually trigger reminder check (for testing or admin purposes)
 */
const triggerReminderCheck = async () => {
  console.log('⚡ Manual reminder check triggered');
  await checkAndSendReminders();
};

/**
 * Stop all cron jobs
 * Called when server is shutting down
 */
const stopCronJobs = () => {
  console.log('🛑 Stopping cron jobs...');

  if (appointmentReminderJob) {
    appointmentReminderJob.stop();
    console.log('✅ Appointment reminder job stopped');
  }
};

/**
 * Get status of all cron jobs
 */
const getCronStatus = async () => {
  try {
    const scheduledCount = await Appointment.countDocuments({
      status: { $in: ['scheduled', 'confirmed'] },
    });

    const pending24h = await Appointment.countDocuments({
      reminder_24h_sent: false,
      status: { $in: ['scheduled', 'confirmed'] },
    });

    const pending1h = await Appointment.countDocuments({
      reminder_1h_sent: false,
      status: { $in: ['scheduled', 'confirmed'] },
    });

    return {
      status: 'running',
      appointmentReminderJobActive: appointmentReminderJob ? true : false,
      statistics: {
        totalScheduledAppointments: scheduledCount,
        pending24HourReminders: pending24h,
        pending1HourReminders: pending1h,
      },
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
    };
  }
};

module.exports = {
  initCronJobs,
  stopCronJobs,
  triggerReminderCheck,
  getCronStatus,
  checkAndSendReminders,
};
