const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Models
const User = require('./models/User');

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

const seedDoctors = async () => {
  try {
    // Check if doctors already exist
    const existingDoctors = await User.find({ role: 'doctor' });
    if (existingDoctors.length > 0) {
      console.log('✅ Doctors already exist in database');
      console.log(`Found ${existingDoctors.length} doctors`);
      existingDoctors.forEach(doc => {
        console.log(`- Dr. ${doc.firstName} ${doc.lastName} (${doc.specialization})`);
      });
      process.exit(0);
      return;
    }

    console.log('📝 Creating sample doctors...');

    const doctors = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@mediflow.com',
        password: 'password123',
        phone: '+1234567890',
        role: 'doctor',
        specialization: 'Cardiology',
        qualification: 'MD, FACC',
        experience: 15,
        consultationFee: 150,
        department: 'Cardiology',
        licenseNumber: 'MD123456',
        availability: [
          {
            day: 'Monday',
            slots: [
              { startTime: '09:00', endTime: '09:30', isAvailable: true },
              { startTime: '09:30', endTime: '10:00', isAvailable: true },
              { startTime: '10:00', endTime: '10:30', isAvailable: true },
              { startTime: '10:30', endTime: '11:00', isAvailable: true },
              { startTime: '11:00', endTime: '11:30', isAvailable: true },
              { startTime: '14:00', endTime: '14:30', isAvailable: true },
              { startTime: '14:30', endTime: '15:00', isAvailable: true },
              { startTime: '15:00', endTime: '15:30', isAvailable: true },
            ],
          },
          {
            day: 'Tuesday',
            slots: [
              { startTime: '09:00', endTime: '09:30', isAvailable: true },
              { startTime: '09:30', endTime: '10:00', isAvailable: true },
              { startTime: '10:00', endTime: '10:30', isAvailable: true },
              { startTime: '10:30', endTime: '11:00', isAvailable: true },
              { startTime: '14:00', endTime: '14:30', isAvailable: true },
              { startTime: '14:30', endTime: '15:00', isAvailable: true },
            ],
          },
          {
            day: 'Wednesday',
            slots: [
              { startTime: '09:00', endTime: '09:30', isAvailable: true },
              { startTime: '09:30', endTime: '10:00', isAvailable: true },
              { startTime: '10:00', endTime: '10:30', isAvailable: true },
              { startTime: '10:30', endTime: '11:00', isAvailable: true },
              { startTime: '14:00', endTime: '14:30', isAvailable: true },
              { startTime: '14:30', endTime: '15:00', isAvailable: true },
            ],
          },
          {
            day: 'Thursday',
            slots: [
              { startTime: '09:00', endTime: '09:30', isAvailable: true },
              { startTime: '09:30', endTime: '10:00', isAvailable: true },
              { startTime: '10:00', endTime: '10:30', isAvailable: true },
              { startTime: '10:30', endTime: '11:00', isAvailable: true },
              { startTime: '14:00', endTime: '14:30', isAvailable: true },
              { startTime: '14:30', endTime: '15:00', isAvailable: true },
            ],
          },
          {
            day: 'Friday',
            slots: [
              { startTime: '09:00', endTime: '09:30', isAvailable: true },
              { startTime: '09:30', endTime: '10:00', isAvailable: true },
              { startTime: '10:00', endTime: '10:30', isAvailable: true },
              { startTime: '10:30', endTime: '11:00', isAvailable: true },
            ],
          },
        ],
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@mediflow.com',
        password: 'password123',
        phone: '+1234567891',
        role: 'doctor',
        specialization: 'Pediatrics',
        qualification: 'MD, FAAP',
        experience: 12,
        consultationFee: 120,
        department: 'Pediatrics',
        licenseNumber: 'MD123457',
        availability: [
          {
            day: 'Monday',
            slots: [
              { startTime: '10:00', endTime: '10:30', isAvailable: true },
              { startTime: '10:30', endTime: '11:00', isAvailable: true },
              { startTime: '11:00', endTime: '11:30', isAvailable: true },
              { startTime: '11:30', endTime: '12:00', isAvailable: true },
              { startTime: '15:00', endTime: '15:30', isAvailable: true },
              { startTime: '15:30', endTime: '16:00', isAvailable: true },
            ],
          },
          {
            day: 'Tuesday',
            slots: [
              { startTime: '10:00', endTime: '10:30', isAvailable: true },
              { startTime: '10:30', endTime: '11:00', isAvailable: true },
              { startTime: '11:00', endTime: '11:30', isAvailable: true },
              { startTime: '15:00', endTime: '15:30', isAvailable: true },
              { startTime: '15:30', endTime: '16:00', isAvailable: true },
            ],
          },
          {
            day: 'Wednesday',
            slots: [
              { startTime: '10:00', endTime: '10:30', isAvailable: true },
              { startTime: '10:30', endTime: '11:00', isAvailable: true },
              { startTime: '11:00', endTime: '11:30', isAvailable: true },
              { startTime: '15:00', endTime: '15:30', isAvailable: true },
              { startTime: '15:30', endTime: '16:00', isAvailable: true },
            ],
          },
          {
            day: 'Thursday',
            slots: [
              { startTime: '10:00', endTime: '10:30', isAvailable: true },
              { startTime: '10:30', endTime: '11:00', isAvailable: true },
              { startTime: '11:00', endTime: '11:30', isAvailable: true },
              { startTime: '15:00', endTime: '15:30', isAvailable: true },
              { startTime: '15:30', endTime: '16:00', isAvailable: true },
            ],
          },
          {
            day: 'Friday',
            slots: [
              { startTime: '10:00', endTime: '10:30', isAvailable: true },
              { startTime: '10:30', endTime: '11:00', isAvailable: true },
              { startTime: '11:00', endTime: '11:30', isAvailable: true },
            ],
          },
        ],
      },
      {
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@mediflow.com',
        password: 'password123',
        phone: '+1234567892',
        role: 'doctor',
        specialization: 'Orthopedics',
        qualification: 'MD, FAAOS',
        experience: 18,
        consultationFee: 180,
        department: 'Orthopedics',
        licenseNumber: 'MD123458',
        availability: [
          {
            day: 'Monday',
            slots: [
              { startTime: '08:00', endTime: '08:30', isAvailable: true },
              { startTime: '08:30', endTime: '09:00', isAvailable: true },
              { startTime: '09:00', endTime: '09:30', isAvailable: true },
              { startTime: '13:00', endTime: '13:30', isAvailable: true },
              { startTime: '13:30', endTime: '14:00', isAvailable: true },
            ],
          },
          {
            day: 'Wednesday',
            slots: [
              { startTime: '08:00', endTime: '08:30', isAvailable: true },
              { startTime: '08:30', endTime: '09:00', isAvailable: true },
              { startTime: '09:00', endTime: '09:30', isAvailable: true },
              { startTime: '13:00', endTime: '13:30', isAvailable: true },
              { startTime: '13:30', endTime: '14:00', isAvailable: true },
            ],
          },
          {
            day: 'Friday',
            slots: [
              { startTime: '08:00', endTime: '08:30', isAvailable: true },
              { startTime: '08:30', endTime: '09:00', isAvailable: true },
              { startTime: '09:00', endTime: '09:30', isAvailable: true },
              { startTime: '13:00', endTime: '13:30', isAvailable: true },
              { startTime: '13:30', endTime: '14:00', isAvailable: true },
            ],
          },
        ],
      },
    ];

    for (const doctorData of doctors) {
      await User.create(doctorData);
      console.log(`✅ Created Dr. ${doctorData.firstName} ${doctorData.lastName} (${doctorData.specialization})`);
    }

    console.log('\n🎉 Sample doctors created successfully!');
    console.log('\nYou can now book appointments with these doctors:');
    console.log('📧 Email: john.smith@mediflow.com');
    console.log('📧 Email: sarah.johnson@mediflow.com');
    console.log('📧 Email: michael.chen@mediflow.com');
    console.log('🔑 Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding doctors:', error);
    process.exit(1);
  }
};

seedDoctors();
