const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cronService = require('./utils/cronService');

dotenv.config();

// Data cleanup utility
const cleanupMalformedData = async () => {
  try {
    const Queue = require('./models/Queue');
    const Appointment = require('./models/Appointment');
    const User = require('./models/User');

    // Remove queue entries with missing doctor references
    const queueEntriesWithoutDoctor = await Queue.deleteMany({ doctor: null });
    if (queueEntriesWithoutDoctor.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${queueEntriesWithoutDoctor.deletedCount} queue entries with null doctor`);
    }

    // Remove appointments with missing doctor references
    const appointmentsWithoutDoctor = await Appointment.deleteMany({ doctor: null });
    if (appointmentsWithoutDoctor.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${appointmentsWithoutDoctor.deletedCount} appointments with null doctor`);
    }

    // Find queue entries with non-existent doctor references
    const queueEntries = await Queue.find().select('doctor _id');
    let queueCleanedCount = 0;
    for (const entry of queueEntries) {
      if (entry.doctor) {
        const doctorExists = await User.findById(entry.doctor);
        if (!doctorExists) {
          await Queue.deleteOne({ _id: entry._id });
          queueCleanedCount++;
        }
      }
    }
    if (queueCleanedCount > 0) {
      console.log(`🧹 Cleaned up ${queueCleanedCount} queue entries with non-existent doctors`);
    }

    // Find appointments with non-existent doctor references
    const appointments = await Appointment.find().select('doctor _id');
    let appointmentCleanedCount = 0;
    for (const appt of appointments) {
      if (appt.doctor) {
        const doctorExists = await User.findById(appt.doctor);
        if (!doctorExists) {
          await Appointment.deleteOne({ _id: appt._id });
          appointmentCleanedCount++;
        }
      }
    }
    if (appointmentCleanedCount > 0) {
      console.log(`🧹 Cleaned up ${appointmentCleanedCount} appointments with non-existent doctors`);
    }
  } catch (error) {
    console.error('❌ Data cleanup error:', error.message);
  }
};

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connected successfully');
    // Clean up malformed data
    await cleanupMalformedData();
    // Initialize cron jobs after successful MongoDB connection
    cronService.initCronJobs();
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Socket.IO for real-time queue updates
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join doctor's queue room
  socket.on('joinDoctorQueue', (doctorId) => {
    socket.join(`doctor-${doctorId}`);
    console.log(`Socket ${socket.id} joined doctor-${doctorId} queue`);
  });

  // Join patient's room
  socket.on('joinPatientRoom', (patientId) => {
    socket.join(`patient-${patientId}`);
    console.log(`Socket ${socket.id} joined patient-${patientId} room`);
  });

  // Leave rooms
  socket.on('leaveRoom', (room) => {
    socket.leave(room);
    console.log(`Socket ${socket.id} left ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'MediFlow API Server is running!' });
});

// Import routes
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const doctorRoutes = require('./routes/doctors');
const queueRoutes = require('./routes/queue');
const medicalRecordsRoutes = require('./routes/medicalRecords');
const userRoutes = require('./routes/users');
const aiRoutes = require('./routes/aiRoutes');
const nlpRoutes = require('./routes/nlpRoutes');
const recommendationsRoutes = require('./routes/recommendationsRoutes');
const statusRoutes = require('./routes/status');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/medical-records', medicalRecordsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/nlp', nlpRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api', statusRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready for real-time updates`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📛 SIGTERM signal received: closing HTTP server');
  cronService.stopCronJobs();
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
    mongoose.connection.close();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📛 SIGINT signal received: closing HTTP server');
  cronService.stopCronJobs();
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
    mongoose.connection.close();
    process.exit(0);
  });
});

module.exports = { app, io };
