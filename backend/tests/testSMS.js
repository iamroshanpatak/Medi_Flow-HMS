const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Appointment = require('../models/Appointment');
const {
  sendAppointmentConfirmationSMS,
  sendAppointmentCancellationSMS,
  sendAppointmentRescheduleSMS,
  sendQueueStatusSMS,
  sendPatientCalledSMS,
} = require('../utils/smsService');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.magenta}❌ ${msg}${colors.reset}`),
  test: (msg) => console.log(`\n${colors.bright}${colors.blue}📱 ${msg}${colors.reset}`),
  wait: (msg) => console.log(`${colors.yellow}⏳ ${msg}${colors.reset}`),
};

// Test data
let testPatient, testDoctor;

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mediflow');
    log.success('Connected to MongoDB');
  } catch (error) {
    log.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
}

// Get or create test patient
async function getTestPatient() {
  try {
    let patient = await User.findOne({ email: 'sms.test.patient@test.com' });
    
    if (!patient) {
      log.wait('Creating test patient...');
      patient = await User.create({
        firstName: 'SMS',
        lastName: 'Test',
        email: 'sms.test.patient@test.com',
        phone: '+977-9800000001',
        password: 'Test@123',
        role: 'patient',
        gender: 'male',
        dateOfBirth: new Date('1990-01-01'),
      });
      log.success('Test patient created');
    } else {
      log.success('Test patient found');
    }
    
    return patient;
  } catch (error) {
    log.error(`Failed to get test patient: ${error.message}`);
    throw error;
  }
}

// Get or create test doctor
async function getTestDoctor() {
  try {
    let doctor = await User.findOne({ email: 'sms.test.doctor@test.com' });
    
    if (!doctor) {
      log.wait('Creating test doctor...');
      doctor = await User.create({
        firstName: 'Dr.',
        lastName: 'Tester',
        email: 'sms.test.doctor@test.com',
        phone: '+977-9800000002',
        password: 'Test@123',
        role: 'doctor',
        specialization: 'General Medicine',
        licenseNumber: 'TEST123',
        gender: 'male',
      });
      log.success('Test doctor created');
    } else {
      log.success('Test doctor found');
    }
    
    return doctor;
  } catch (error) {
    log.error(`Failed to get test doctor: ${error.message}`);
    throw error;
  }
}

// Test 1: Send Confirmation SMS
async function testConfirmationSMS() {
  log.test('TEST 1: Appointment Confirmation SMS');
  
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const result = await sendAppointmentConfirmationSMS({
      patientPhone: testPatient.phone,
      patientName: `${testPatient.firstName} ${testPatient.lastName}`,
      doctorName: `${testDoctor.firstName} ${testDoctor.lastName}`,
      appointmentDate: tomorrow.toISOString().split('T')[0],
      startTime: '10:00 AM',
      endTime: '10:30 AM',
    });
    
    if (result.success) {
      log.success(`Confirmation SMS sent (Mode: ${process.env.NODE_ENV})`);
      log.info(`Message ID: ${result.messageId}`);
    } else {
      log.error(`Failed: ${result.error}`);
    }
  } catch (error) {
    log.error(`Test failed: ${error.message}`);
  }
}

// Test 2: Send Cancellation SMS
async function testCancellationSMS() {
  log.test('TEST 2: Appointment Cancellation SMS');
  
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const result = await sendAppointmentCancellationSMS({
      patientPhone: testPatient.phone,
      patientName: `${testPatient.firstName} ${testPatient.lastName}`,
      doctorName: `${testDoctor.firstName} ${testDoctor.lastName}`,
      appointmentDate: tomorrow.toISOString().split('T')[0],
    });
    
    if (result.success) {
      log.success(`Cancellation SMS sent (Mode: ${process.env.NODE_ENV})`);
      log.info(`Message ID: ${result.messageId}`);
    } else {
      log.error(`Failed: ${result.error}`);
    }
  } catch (error) {
    log.error(`Test failed: ${error.message}`);
  }
}

// Test 3: Send Reschedule SMS
async function testRescheduleSMS() {
  log.test('TEST 3: Appointment Reschedule SMS');
  
  try {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const result = await sendAppointmentRescheduleSMS({
      patientPhone: testPatient.phone,
      patientName: `${testPatient.firstName} ${testPatient.lastName}`,
      doctorName: `${testDoctor.firstName} ${testDoctor.lastName}`,
      oldDate: today.toISOString().split('T')[0],
      newDate: tomorrow.toISOString().split('T')[0],
      newStartTime: '2:00 PM',
      newEndTime: '2:30 PM',
    });
    
    if (result.success) {
      log.success(`Reschedule SMS sent (Mode: ${process.env.NODE_ENV})`);
      log.info(`Message ID: ${result.messageId}`);
    } else {
      log.error(`Failed: ${result.error}`);
    }
  } catch (error) {
    log.error(`Test failed: ${error.message}`);
  }
}

// Test 4: Send Queue Status SMS
async function testQueueStatusSMS() {
  log.test('TEST 4: Queue Status SMS');
  
  try {
    const result = await sendQueueStatusSMS({
      patientPhone: testPatient.phone,
      patientName: `${testPatient.firstName} ${testPatient.lastName}`,
      tokenNumber: 5,
      position: 3,
      estimatedWaitTime: 45,
      doctorName: `${testDoctor.firstName} ${testDoctor.lastName}`,
    });
    
    if (result.success) {
      log.success(`Queue Status SMS sent (Mode: ${process.env.NODE_ENV})`);
      log.info(`Message ID: ${result.messageId}`);
    } else {
      log.error(`Failed: ${result.error}`);
    }
  } catch (error) {
    log.error(`Test failed: ${error.message}`);
  }
}

// Test 5: Send Patient Called SMS
async function testPatientCalledSMS() {
  log.test('TEST 5: Patient Called SMS');
  
  try {
    const result = await sendPatientCalledSMS({
      patientPhone: testPatient.phone,
      patientName: `${testPatient.firstName} ${testPatient.lastName}`,
      doctorName: `${testDoctor.firstName} ${testDoctor.lastName}`,
    });
    
    if (result.success) {
      log.success(`Patient Called SMS sent (Mode: ${process.env.NODE_ENV})`);
      log.info(`Message ID: ${result.messageId}`);
    } else {
      log.error(`Failed: ${result.error}`);
    }
  } catch (error) {
    log.error(`Test failed: ${error.message}`);
  }
}

// Main test runner
async function runTests() {
  console.log(`\n${colors.bright}${colors.magenta}═══════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta}   MediFlow SMS Integration Test Suite${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta}═══════════════════════════════════════════${colors.reset}\n`);
  
  log.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  log.info(`Node Version: ${process.version}`);
  
  try {
    // Connect to database
    await connectDB();
    
    // Get test users
    log.wait('Setting up test users...\n');
    testPatient = await getTestPatient();
    testDoctor = await getTestDoctor();
    
    log.info(`Patient Phone: ${testPatient.phone}`);
    log.info(`Doctor: Dr. ${testDoctor.lastName}\n`);
    
    // Display mode information
    if (process.env.NODE_ENV === 'production') {
      log.info('🔴 PRODUCTION MODE: SMS will be sent via Twilio');
      log.info('Ensure TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are set\n');
    } else {
      log.info('🟢 DEVELOPMENT MODE: SMS messages will be logged to console\n');
    }
    
    // Run all tests
    await testConfirmationSMS();
    await testCancellationSMS();
    await testRescheduleSMS();
    await testQueueStatusSMS();
    await testPatientCalledSMS();
    
    // Summary
    console.log(`\n${colors.bright}${colors.magenta}═══════════════════════════════════════════${colors.reset}`);
    log.success('All SMS tests completed!');
    console.log(`${colors.bright}${colors.magenta}═══════════════════════════════════════════${colors.reset}\n`);
    
    log.info(`To test with real API endpoints, use the REST API Test Guide`);
    log.info(`See: SMS_TEST_GUIDE.md for detailed instructions\n`);
    
  } catch (error) {
    log.error(`Test suite failed: ${error.message}`);
    console.error(error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    log.success('Database connection closed');
    process.exit(0);
  }
}

// Run tests
runTests();
