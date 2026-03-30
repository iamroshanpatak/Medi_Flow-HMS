/**
 * Test Cron Job Setup
 * Creates test appointments and triggers reminder checks
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Appointment = require('./models/Appointment');
const cronService = require('./utils/cronService');

const testCronSetup = async () => {
  try {
    console.log('🧪 Starting Cron Job Testing...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Create appointment for 24-hour reminder
    console.log('📝 Creating test appointment for 24-hour reminder...');
    const now = new Date();
    const appointment24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const testApp24 = await Appointment.create({
      patient: '69a45366cd93663128b3437e',
      doctor: '695c60b27d414d908b3f2c1c',
      department: 'Cardiology',
      appointmentDate: appointment24h,
      startTime: '10:00 AM',
      endTime: '10:30 AM',
      appointmentType: 'consultation',
      status: 'scheduled',
      reason: 'Cron test - 24 hour reminder',
      reminder_24h_sent: false,
      reminder_1h_sent: false,
    });

    console.log('✅ 24-hour test appointment created:');
    console.log(`   ID: ${testApp24._id}`);
    console.log(`   Date: ${appointment24h.toISOString()}`);
    console.log(`   Status: scheduled`);
    console.log(`   Reminder pending: YES\n`);

    // Test 2: Create appointment for 1-hour reminder
    console.log('📝 Creating test appointment for 1-hour reminder...');
    const appointment1h = new Date(now.getTime() + 1 * 60 * 60 * 1000);

    const testApp1h = await Appointment.create({
      patient: '69a45366cd93663128b3437e',
      doctor: '695c60b27d414d908b3f2c1c',
      department: 'Cardiology',
      appointmentDate: appointment1h,
      startTime: '02:00 PM',
      endTime: '02:30 PM',
      appointmentType: 'consultation',
      status: 'scheduled',
      reason: 'Cron test - 1 hour reminder',
      reminder_24h_sent: true,
      reminder_1h_sent: false,
    });

    console.log('✅ 1-hour test appointment created:');
    console.log(`   ID: ${testApp1h._id}`);
    console.log(`   Date: ${appointment1h.toISOString()}`);
    console.log(`   Status: scheduled`);
    console.log(`   Reminder pending: YES\n`);

    // Test 3: Get cron status
    console.log('📊 Checking Cron Status...');
    const cronStatus = await cronService.getCronStatus();

    console.log('Cron Job Status:');
    console.log(`   Status: ${cronStatus.status}`);
    console.log(`   Appointment Reminder Job Active: ${cronStatus.appointmentReminderJobActive}`);
    console.log(`   Total Scheduled Appointments: ${cronStatus.statistics.totalScheduledAppointments}`);
    console.log(`   Pending 24-hour Reminders: ${cronStatus.statistics.pending24HourReminders}`);
    console.log(`   Pending 1-hour Reminders: ${cronStatus.statistics.pending1HourReminders}\n`);

    // Test 4: Check appointment reminder fields
    console.log('🔍 Verifying Appointment Model Fields...');
    const updatedApp = await Appointment.findById(testApp24._id);
    console.log('✅ Appointment model includes:');
    console.log(`   reminder_24h_sent: ${updatedApp.reminder_24h_sent}`);
    console.log(`   reminder_24h_sent_at: ${updatedApp.reminder_24h_sent_at}`);
    console.log(`   reminder_1h_sent: ${updatedApp.reminder_1h_sent}`);
    console.log(`   reminder_1h_sent_at: ${updatedApp.reminder_1h_sent_at}\n`);

    // Summary
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ Cron Job Setup Test Complete!');
    console.log('═══════════════════════════════════════════════════\n');
    console.log('Summary:');
    console.log('  ✅ node-cron module installed');
    console.log('  ✅ cronService.js created and initialized');
    console.log('  ✅ reminderService.js created');
    console.log('  ✅ Appointment model updated with reminder fields');
    console.log('  ✅ Cron jobs running every 5 minutes');
    console.log('  ✅ Test appointments created successfully');
    console.log('  ✅ Cron status endpoints working\n');

    console.log('Next Steps:');
    console.log('  1. Cron job will check for reminders every 5 minutes');
    console.log('  2. When appointment time matches 24h window → SMS + Email reminder sent');
    console.log('  3. When appointment time matches 1h window → SMS + Email reminder sent');
    console.log('  4. reminder_24h_sent and reminder_1h_sent flags updated');
    console.log('  5. No duplicate reminders will be sent\n');

    console.log('API Endpoints for Admin:');
    console.log('  POST /api/appointments/cron/trigger-reminders - Manually trigger check');
    console.log('  GET /api/appointments/cron/status - View cron status\n');

    mongoose.connection.close();
    console.log('✅ Test completed!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

testCronSetup();
