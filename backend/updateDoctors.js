const mongoose = require('mongoose');
require('dotenv').config();

// Models
const User = require('./models/User');

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

const updateDoctors = async () => {
  try {
    console.log('🔄 Updating existing doctors with specializations and availability...');

    const doctors = await User.find({ role: 'doctor' });
    
    if (doctors.length === 0) {
      console.log('❌ No doctors found in database');
      process.exit(1);
      return;
    }

    const specializations = ['Cardiology', 'Pediatrics', 'Orthopedics'];
    const departments = ['Cardiology', 'Pediatrics', 'Orthopedics'];
    const qualifications = ['MD, FACC', 'MD, FAAP', 'MD, FAAOS'];
    
    const availability = [
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
    ];

    for (let i = 0; i < doctors.length; i++) {
      const doctor = doctors[i];
      const index = i % 3; // Cycle through the 3 specializations
      
      doctor.specialization = specializations[index];
      doctor.department = departments[index];
      doctor.qualification = qualifications[index];
      doctor.experience = 10 + (i * 2);
      doctor.consultationFee = 100 + (i * 20);
      doctor.licenseNumber = `MD12345${i}`;
      doctor.availability = availability;
      
      await doctor.save({ validateBeforeSave: false }); // Skip password hashing
      console.log(`✅ Updated Dr. ${doctor.firstName} ${doctor.lastName} (${doctor.specialization})`);
    }

    console.log('\n🎉 All doctors updated successfully!');
    console.log('\nDoctors now have:');
    console.log('- Specializations (Cardiology, Pediatrics, Orthopedics)');
    console.log('- Availability slots (Mon-Fri, 9am-4pm)');
    console.log('- Consultation fees');
    console.log('- License numbers');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating doctors:', error);
    process.exit(1);
  }
};

updateDoctors();
