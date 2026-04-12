const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const cronService = require('./utils/cronService');

dotenv.config();

// Rate limiting middleware - Apply to all requests
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// DISABLED: Automatic data cleanup - This caused data loss
// Instead, provide manual cleanup endpoint for admins only
// Data integrity is more important than cleaning orphaned records

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting
app.useInitialize cron jobs after successful MongoDB connection (with safety checks)
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
const dashboardRoutes = require('./routes/dashboard');

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
app.use('/api/dashboard', dashboardRoutes);
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

module.exports = { app, io, authLimiter };
