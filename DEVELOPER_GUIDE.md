# 👨‍💻 MediFlow Developer Guide

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Setting Up Development Environment](#setting-up-development-environment)
4. [Frontend Development](#frontend-development)
5. [Backend Development](#backend-development)
6. [Database Schema](#database-schema)
7. [Adding New Features](#adding-new-features)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

MediFlow follows a **client-server architecture** with real-time capabilities:

```
┌─────────────┐
│   Client    │ (Next.js + TypeScript + Tailwind CSS)
│  (Port 3000)│
└──────┬──────┘
       │ REST API + WebSockets
       │
┌──────▼──────┐
│   Server    │ (Express.js + Node.js)
│  (Port 5000)│
└──────┬──────┘
       │ Query/Update
       │
┌──────▼──────┐
│  MongoDB    │
└─────────────┘
```

### Key Features:
- **Real-time Queue Management**: WebSocket-based queue updates
- **Role-Based Access Control**: Patient, Doctor, Admin roles
- **JWT Authentication**: Secure token-based authentication
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS
- **Type Safety**: Full TypeScript support on frontend

---

## Project Structure

### Frontend (`/client`)
```
client/
├── app/                        # Next.js App Router
│   ├── (auth)/                # Auth-related pages
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── admin/                 # Admin pages
│   │   ├── dashboard/
│   │   └── users/
│   ├── doctor/                # Doctor pages
│   │   ├── dashboard/
│   │   ├── queue/
│   │   └── medical-records/
│   ├── patient/               # Patient pages
│   │   ├── dashboard/
│   │   ├── appointments/
│   │   ├── book-appointment/
│   │   └── queue/
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Landing page
│
├── components/                # Reusable components
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── Card.tsx
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── ProtectedRoute.tsx
│   ├── ChangePasswordModal.tsx
│   └── Toast.tsx
│
├── contexts/                  # React contexts
│   └── AuthContext.tsx        # Authentication state
│
├── lib/                       # Utility functions
│   └── api.ts                 # Axios instance & API calls
│
├── types/                     # TypeScript types
│   └── index.ts
│
├── public/                    # Static assets
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Backend (`/server`)
```
server/
├── models/                    # MongoDB schemas
│   ├── User.js               # User model
│   ├── Appointment.js        # Appointment model
│   ├── Queue.js              # Queue model
│   ├── MedicalRecord.js      # Medical records model
│   └── Department.js         # Department model
│
├── routes/                    # API routes
│   ├── auth.js               # Authentication routes
│   ├── doctors.js            # Doctor-related routes
│   ├── appointments.js       # Appointment routes
│   ├── queue.js              # Queue management routes
│   └── medicalRecords.js     # Medical records routes
│
├── middleware/               # Custom middleware
│   └── auth.js              # JWT verification middleware
│
├── controllers/              # Route controllers (empty - add here)
│
├── server.js                # Main server file
├── package.json
└── .env                     # Environment variables
```

---

## Setting Up Development Environment

### Prerequisites
- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **MongoDB**: Local or Atlas account
- **Git**: Version control

### Installation Steps

1. **Clone and navigate to project:**
```bash
cd /Users/apple/Desktop/Medi_Flow
```

2. **Install backend dependencies:**
```bash
cd server
npm install
```

3. **Install frontend dependencies:**
```bash
cd ../client
npm install
```

4. **Configure environment variables:**

**Backend** (`server/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mediflow
CLIENT_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Optional: Email notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Optional: SMS notifications
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
```

**Frontend** (`client/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

5. **Start MongoDB:**
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or run directly
mongod
```

6. **Start development servers:**

Terminal 1 - Backend:
```bash
cd server
npm run dev
```

Terminal 2 - Frontend:
```bash
cd client
npm run dev
```

7. **Access the application:**
- Frontend: http://localhost:3000
- API: http://localhost:5000/api
- MongoDB Admin: mongosh

---

## Frontend Development

### Key Technologies
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client
- **Socket.IO Client**: Real-time communication
- **React Hot Toast**: Notifications

### Adding a New Page

1. **Create a new route in `app/` directory:**
```tsx
// app/patient/medical-records/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/Card';
import { api } from '@/lib/api';

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await api.get('/medical-records');
      setRecords(response.data.records);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Medical Records</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {records.map((record) => (
          <Card key={record._id}>
            <h3 className="font-semibold">{record.diagnosis}</h3>
            <p className="text-sm text-gray-600">{record.visitDate}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

2. **Use the AuthContext for protected pages:**
```tsx
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export default function ProtectedPage() {
  const { user, token } = useContext(AuthContext);

  if (!user) {
    return <div>Access Denied</div>;
  }

  return <div>Welcome, {user.name}!</div>;
}
```

### API Calls
Use the pre-configured Axios instance in `lib/api.ts`:

```tsx
import { api } from '@/lib/api';

// GET request
const response = await api.get('/doctors');

// POST request
const response = await api.post('/appointments', {
  doctorId: '123',
  dateTime: '2026-02-01T10:00:00'
});

// PUT request
const response = await api.put('/appointments/123', {
  status: 'cancelled'
});

// DELETE request
const response = await api.delete('/appointments/123');
```

### Styling
Use Tailwind CSS classes:
```tsx
<div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
  <h2 className="text-xl font-bold text-gray-900">Title</h2>
  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
    Action
  </button>
</div>
```

---

## Backend Development

### Adding a New Route

1. **Create a route file in `server/routes/`:**
```javascript
// server/routes/notifications.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Get user notifications
router.get('/', protect, async (req, res) => {
  try {
    // Your logic here
    res.json({ message: 'Notifications fetched' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

2. **Mount the route in `server.js`:**
```javascript
const notificationRoutes = require('./routes/notifications');
app.use('/api/notifications', notificationRoutes);
```

### Adding a New Model

1. **Create a model file in `server/models/`:**
```javascript
// server/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['appointment', 'queue', 'message'],
    default: 'message'
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
```

### Authentication Middleware
Use the provided auth middleware for protected routes:

```javascript
const { protect } = require('../middleware/auth');

// Protected route
router.get('/profile', protect, (req, res) => {
  // req.user contains decoded JWT payload
  res.json({ user: req.user });
});
```

### Error Handling
Implement consistent error handling:

```javascript
try {
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user);
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ message: 'Server error', error: error.message });
}
```

---

## Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  role: String (patient|doctor|admin),
  phone: String,
  department: String (for doctors),
  avatar: String (URL),
  createdAt: Date,
  updatedAt: Date
}
```

### Appointment Model
```javascript
{
  _id: ObjectId,
  patientId: ObjectId (ref: User),
  doctorId: ObjectId (ref: User),
  departmentId: ObjectId (ref: Department),
  dateTime: Date,
  duration: Number (minutes),
  reason: String,
  notes: String,
  status: String (scheduled|completed|cancelled),
  createdAt: Date,
  updatedAt: Date
}
```

### Queue Model
```javascript
{
  _id: ObjectId,
  patientId: ObjectId (ref: User),
  departmentId: ObjectId (ref: Department),
  appointmentId: ObjectId (ref: Appointment),
  position: Number,
  status: String (waiting|called|completed),
  joinedAt: Date,
  calledAt: Date,
  completedAt: Date
}
```

### MedicalRecord Model
```javascript
{
  _id: ObjectId,
  patientId: ObjectId (ref: User),
  doctorId: ObjectId (ref: User),
  visitDate: Date,
  diagnosis: String,
  symptoms: [String],
  prescription: String,
  notes: String,
  attachments: [String] (URLs),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Adding New Features

### Example: Add SMS Notifications
1. **Install Twilio:**
```bash
npm install twilio
```

2. **Create notification utility:**
```javascript
// server/utils/notifications.js
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendAppointmentSMS(phoneNumber, appointmentDetails) {
  try {
    await client.messages.create({
      body: `Your appointment with Dr. ${appointmentDetails.doctorName} is scheduled for ${appointmentDetails.dateTime}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
  } catch (error) {
    console.error('SMS Error:', error);
  }
}

module.exports = { sendAppointmentSMS };
```

3. **Use in routes:**
```javascript
const { sendAppointmentSMS } = require('../utils/notifications');

router.post('/appointments', protect, async (req, res) => {
  // Create appointment
  const appointment = await Appointment.create(req.body);
  
  // Send SMS notification
  await sendAppointmentSMS(req.user.phone, {
    doctorName: 'Smith',
    dateTime: appointment.dateTime
  });
  
  res.status(201).json(appointment);
});
```

---

## Testing

### Frontend Testing (with Jest)
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

Create test files:
```typescript
// components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import Button from '../Button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Backend Testing (with Jest)
```bash
npm install --save-dev jest supertest
```

Create test files:
```javascript
// routes/__tests__/auth.test.js
const request = require('supertest');
const app = require('../../server');

describe('Auth Routes', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'patient'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.token).toBeDefined();
  });
});
```

---

## Deployment

### Frontend Deployment (Vercel)
1. **Build the project:**
```bash
cd client
npm run build
```

2. **Deploy to Vercel:**
```bash
npm install -g vercel
vercel deploy --prod
```

### Backend Deployment (Heroku/Railway)
1. **Create Procfile:**
```
web: node server.js
```

2. **Set environment variables on hosting platform**

3. **Deploy:**
```bash
git push heroku main
```

---

## Troubleshooting

### MongoDB Connection Error
**Problem:** `Error: connect ECONNREFUSED`
**Solution:** Start MongoDB service
```bash
brew services start mongodb-community
```

### JWT Token Expired
**Problem:** 401 Unauthorized
**Solution:** Login again to get a new token

### CORS Error
**Problem:** `Access to XMLHttpRequest has been blocked by CORS policy`
**Solution:** Ensure `CLIENT_URL` in `.env` matches frontend URL

### WebSocket Connection Failed
**Problem:** Real-time updates not working
**Solution:** Check if backend is running on correct port (5000)

### Port Already in Use
**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`
**Solution:** Kill process on port
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

---

## Best Practices

### Code Style
- Use consistent naming conventions (camelCase for variables, PascalCase for components)
- Write meaningful comments for complex logic
- Keep functions small and focused (single responsibility)
- Use arrow functions in modern JavaScript

### Security
- Never commit `.env` files
- Always validate and sanitize user input
- Use HTTPS in production
- Hash passwords with bcrypt
- Implement rate limiting on API routes
- Use parameterized database queries to prevent SQL injection

### Performance
- Lazy load components and images
- Use pagination for large datasets
- Cache API responses when appropriate
- Optimize database queries with indexes
- Use compression for responses

### Version Control
- Create feature branches for new features
- Write descriptive commit messages
- Use Pull Requests for code review
- Keep commits atomic and logical

