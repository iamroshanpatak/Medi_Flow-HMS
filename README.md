# MediFlow - Hospital Management System

A modern, responsive web application for hospital management with real-time queue management, appointment booking, and role-based dashboards for patients, doctors, and administrators.

## Project Overview

MediFlow is a comprehensive hospital management system designed to:
- Streamline patient care and reduce waiting times
- Enable online appointment booking and management
- Provide real-time queue updates using WebSockets
- Offer role-specific dashboards for different user types
- Manage medical records and prescriptions
- Support SMS/Email notifications for appointments

##  Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern, responsive styling
- **Lucide React** - Beautiful icon library
- **Axios** - HTTP client for API requests
- **Socket.IO Client** - Real-time updates
- **React Hot Toast** - Notifications
- **Recharts** - Data visualization

### Backend
- **Node.js** with **Express** - Server framework
- **MongoDB** with **Mongoose** - Database and ODM
- **JWT** - Authentication
- **Socket.IO** - Real-time queue updates
- **Redis** - Queue management and caching
- **Bcrypt** - Password hashing
- **Nodemailer** - Email notifications
- **Twilio** - SMS notifications

## Project Structure

```
Medi_Flow/
├── frontend/              # Frontend (Next.js + TypeScript)
│   ├── app/              # Next.js App Router pages
│   │   ├── admin/        # Admin dashboard pages
│   │   ├── doctor/       # Doctor dashboard pages
│   │   ├── patient/      # Patient portal pages
│   │   ├── login/        # Login page
│   │   ├── register/     # Registration page
│   │   ├── profile/      # User profile
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   ├── components/       # Reusable UI components
│   ├── contexts/         # React Context providers
│   ├── services/         # API services (Axios)
│   ├── styles/           # Global styles
│   ├── types/            # TypeScript types
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── public/           # Static assets
│   └── package.json
│
├── backend/              # Backend (Node.js + Express)
│   ├── routes/          # API route handlers
│   │   ├── auth.js
│   │   ├── appointments.js
│   │   ├── doctors.js
│   │   ├── medicalRecords.js
│   │   └── queue.js
│   ├── models/          # MongoDB schemas (Mongoose)
│   │   ├── User.js
│   │   ├── Appointment.js
│   │   ├── MedicalRecord.js
│   │   ├── Queue.js
│   │   └── Department.js
│   ├── middleware/      # Express middleware
│   │   └── auth.js
│   ├── controllers/     # Business logic
│   ├── server.js        # Server entry point
│   └── package.json
│
├── database/            # Database organization
│   ├── schemas/        # Database models (reference)
│   ├── seeders/        # Seed scripts
│   └── migrations/     # Database migrations
│
├── start.sh            # Quick start script
└── README.md

**See [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) for detailed organization.**

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Quick Start

```bash
# Start both frontend and backend
./start.sh
```

The script will automatically:
- Check MongoDB connection
- Start backend on port 5001
- Start frontend on port 3000

### Manual Installation

### 1. Clone the repository
```bash
git clone https://github.com/iamroshanpatak/Medi_Flow-HMS.git
cd Medi_Flow-HMS
```

### 2. Install dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3. Environment Configuration

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
```

**Backend (.env):**
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/mediflow
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=7d
REDIS_URL=redis://localhost:6379
NODE_ENV=development

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Twilio Configuration (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### 4. Start MongoDB
```bash
# If using local MongoDB
mongod
```

### 5. Run the application

**Using start script (Recommended):**
```bash
./start.sh
```

**Manual start:**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

##  Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001

> **Note:** Backend uses port 5001 instead of 5000 to avoid conflicts with macOS AirPlay Receiver.

##  User Roles & Features

### Patient Features
- Register and create profile
- Book, reschedule, and cancel appointments
- View appointment history
- Check real-time queue status
- Track token number and wait time
- View medical records and prescriptions
- Receive SMS/Email notifications
- Rate doctors and provide feedback

### Doctor Features
- View daily schedule and appointments
- Manage patient queue
- Call next patient in queue
- Update consultation status
- Add prescriptions and diagnoses
- View patient medical history
- Track performance metrics
- Manage availability and time slots

### Admin Features
- Dashboard with system overview
- Manage users (patients, doctors, staff)
- Monitor all appointments
- View department-wise statistics
- Generate reports and analytics
- Manage departments and services
- System configuration
- Queue monitoring across departments

## Authentication

The system uses JWT (JSON Web Tokens) for secure authentication:
- Token-based authentication
- Role-based access control (RBAC)
- Secure password hashing with bcrypt
- Protected API routes
- Session management

## Key Features

### 1. Real-Time Queue Management
- Live queue updates using Socket.IO
- Token generation system
- Estimated wait time calculation
- Priority-based queue handling
- Walk-in and appointment integration

### 2. Appointment System
- Easy online booking
- Doctor availability checking
- Slot management
- Automatic reminders
- Cancellation and rescheduling

### 3. Responsive Design
- Mobile-first approach
- Works on all devices
- Modern UI with Tailwind CSS
- Smooth animations and transitions
- Accessible components

### 4. Notifications
- Email notifications
- SMS alerts (via Twilio)
- In-app notifications
- Appointment reminders
- Queue status updates

## Development Roadmap

Based on your 6-month plan:

✅ **Month 1: Planning, Design & Base Setup** (COMPLETED)
- Project structure created
- Tech stack finalized
- Database schema designed
- UI wireframes implemented
- Base authentication setup

✅ **Month 2: Authentication & User Management** (COMPLETED)
- User registration and login
- Role management
- Profile management
- Admin user management
- Protected routes
- JWT authentication

✅ **Month 3: Appointment Booking System** (COMPLETED)
- Appointment booking
- Reschedule and cancel
- Doctor schedule setup
- Appointment dashboard

✅ **Month 4: Queue Management** (COMPLETED)
- Token generation
- Real-time queue updates
- Doctor queue dashboard
- Walk-in integration

✅ **Month 5: Notifications, AI & Chatbot** (COMPLETED)
- SMS/Email notifications
- Basic AI recommendations
- FAQ chatbot
- NLP intent mapping

✅ **Month 6: Testing, Deployment & Launch** (COMPLETED)
- Integration testing
- Load testing
- Security audit
- Production deployment

## Testing

```bash
# Run tests (to be implemented)
npm test

# Run with coverage
npm run test:coverage
```

## Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
vercel deploy
```

### Backend (Railway/Heroku)
```bash
cd server
# Follow platform-specific deployment guides
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Author

Your Name - Hospital Management System Developer

## Acknowledgments

- Next.js team for the amazing framework
- MongoDB for the flexible database
- Tailwind CSS for the utility-first CSS framework
- All open-source contributors

## Support

For support, email support@mediflow.com or join our Slack channel.

---

**Built with for better healthcare management**
