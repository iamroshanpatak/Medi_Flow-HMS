const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');

dotenv.config();

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
  .then(() => console.log('✅ MongoDB connected successfully'))
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
// const userRoutes = require('./routes/users');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/medical-records', medicalRecordsRoutes);
// app.use('/api/users', userRoutes);

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

module.exports = { app, io };
