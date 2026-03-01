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

const seedDemoUsers = async () => {
  try {
    console.log('📝 Creating demo users...\n');

    const demoUsers = [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@demo.com',
        password: 'password123',
        phone: '+1234567890',
        role: 'admin',
        dateOfBirth: '1985-01-01',
        gender: 'other',
      },
      {
        firstName: 'John',
        lastName: 'Patient',
        email: 'patient@demo.com',
        password: 'password123',
        phone: '+1234567891',
        role: 'patient',
        dateOfBirth: '1990-05-15',
        gender: 'male',
      },
      {
        firstName: 'Sarah',
        lastName: 'Doctor',
        email: 'doctor@demo.com',
        password: 'password123',
        phone: '+1234567892',
        role: 'doctor',
        dateOfBirth: '1982-08-20',
        gender: 'female',
        specialization: 'General Medicine',
        qualification: 'MBBS, MD',
        experience: 12,
        consultationFee: 100,
        department: 'General Medicine',
        licenseNumber: 'DOC123456',
      },
      {
        firstName: 'Mike',
        lastName: 'Staff',
        email: 'staff@demo.com',
        password: 'password123',
        phone: '+1234567893',
        role: 'staff',
        dateOfBirth: '1988-03-10',
        gender: 'male',
      },
    ];

    for (const userData of demoUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`⏭️  ${userData.role.toUpperCase()} user already exists: ${userData.email}`);
        continue;
      }

      // Create new user
      const user = await User.create(userData);
      console.log(`✅ Created ${userData.role.toUpperCase()} user: ${userData.email}`);
    }

    console.log('\n🎉 Demo users setup complete!\n');
    console.log('=========================================');
    console.log('Demo Credentials:');
    console.log('=========================================');
    console.log('Admin:');
    console.log('  Email: admin@demo.com');
    console.log('  Password: password123');
    console.log('');
    console.log('Patient:');
    console.log('  Email: patient@demo.com');
    console.log('  Password: password123');
    console.log('');
    console.log('Doctor:');
    console.log('  Email: doctor@demo.com');
    console.log('  Password: password123');
    console.log('');
    console.log('Staff:');
    console.log('  Email: staff@demo.com');
    console.log('  Password: password123');
    console.log('=========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding demo users:', error);
    process.exit(1);
  }
};

// Run the seeder
seedDemoUsers();
