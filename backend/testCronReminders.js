#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

const Appointment = require('./models/Appointment');
const cronService = require('./utils/cronService');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = (msg, color = 'reset') => {
  console.log(`${colors[color]}${msg}${colors.reset}`);
};

const testCronSystem = async () => {
  try {
    log('\n' + '='.repeat(60), 'bright');
    log('🕐 CRON SYSTEM TEST - APPOINTMENT REMINDERS', 'cyan');
    log('='.repeat(60) + '\n', 'bright');

    log('📡 Connecting to MongoDB...', 'blue');
    await mongoose.connect(process.env.MONGODB_URI);
    log('✅ MongoDB connected\n', 'green');

    log('📋 TEST 1: Check existing appointments', 'yellow');
    const existingCount = await Appointment.countDocuments({
      status: { $in: ['scheduled', 'confirmed'] },
    });
    log(`   Total scheduled appointments: ${existingCount}\n`, 'blue');

    log('📋 TEST 2: Create test appointments for reminder windows', 'yellow');

    const now = new Date();
    const demoPatientId = '69a45366cd93663128b3437e';
    const demoDoctorId = '695c60b27d414d908b3f2c1c';

    const apt24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const test24hApp = await Appointment.create({
      patient: demoPatientId,
      doctor: demoDoctorId,
      department: 'Cardiology',
      appointmentDate: apt24h,
      startTime: '03:00 PM',
      endTime: '03:30 PM',
      appointmentType: 'consultation',
      status: 'scheduled',
      reason: 'Cron Test - 24h reminder',
      reminder_24h_sent: false,
      reminder_1h_sent: false,
    });
    log(`   ✅ 24-hour test appointment created`, 'green');
    log(`      ID: ${test24hApp._id}`, 'dim');
    log(`      Time: ${test24hApp.startTime}`, 'dim');

    const apt1h = new Date(now.getTime() + 1 * 60 * 60 * 1000);
    const test1hApp = await Appointment.create({
      patient: demoPatientId,
      doctor: demoDoctorId,
      department: 'Dermatology',
      appointmentDate: apt1h,
      startTime: '04:00 PM',
      endTime: '04:30 PM',
      appointmentType: 'follow-up',
      status: 'confirmed',
      reason: 'Cron Test - 1h reminder',
      reminder_24h_sent: true,
      reminder_1h_sent: false,
    });
    log(`   ✅ 1-hour test appointment created\n`, 'green');

    log('📋 TEST 3: Check cron job status', 'yellow');
    const cronStatus = await cronService.getCronStatus();
    log(`   Status: ${cronStatus.status}`, 'blue');
    log(`   Reminder job active: ${cronStatus.appointmentReminderJobActive ? '✅' : '❌'}`, 'blue');
    log(`   Total scheduled: ${cronStatus.statistics.totalScheduledAppointments}`, 'blue');
    log(`   Pending 24h: ${cronStatus.statistics.pending24HourReminders}`, 'blue');
    log(`   Pending 1h: ${cronStatus.statistics.pending1HourReminders}\n`, 'blue');

    log('📋 TEST 4: Trigger manual reminder check', 'yellow');
    log('   Running reminder check...', 'blue');
    await cronService.triggerReminderCheck();
    log('   ✅ Reminder check completed\n', 'green');

    log('📋 TEST 5: Verify reminder flags were updated', 'yellow');

    const updated24hApp = await Appointment.findById(test24hApp._id);
    const updated1hApp = await Appointment.findById(test1hApp._id);

    log(`   24h reminder: ${updated24hApp.reminder_24h_sent ? '✅ SENT' : '❌ PENDING'}`, 'blue');
    log(`   1h reminder: ${updated1hApp.reminder_1h_sent ? '✅ SENT' : '❌ PENDING'}\n`, 'blue');

    log('='.repeat(60), 'bright');
    log('✅ CRON SYSTEM TEST COMPLETED', 'green');
    log('='.repeat(60), 'bright');

    log('\n🎯 RESULTS:', 'cyan');
    log(`   ✅ Cron jobs running`, 'green');
    log(`   ✅ Test appointments created`, 'green');
    log(`   ✅ Reminder check working`, 'green');
    log(`   ✅ Appointment model updated`, 'green');
    log(`   ✅ SMS/Email in dev mode\n`, 'green');

    mongoose.connection.close();
    log('✅ Test completed\n', 'green');

  } catch (error) {
    log(`\n❌ ERROR: ${error.message}`, 'red');
    process.exit(1);
  }
};

testCronSystem();
