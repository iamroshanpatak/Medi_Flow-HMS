# 📁 MediFlow Folder Structure

## Project Overview

MediFlow is organized into three main directories: **frontend**, **backend**, and **database**, making it easy to navigate and understand the codebase.

```
Medi_Flow/
├── frontend/           # React/Next.js frontend application
├── backend/            # Node.js/Express backend server
├── database/           # Database schemas, seeders, and migrations
├── start.sh            # Quick start script
└── package.json        # Root package file
```

---

## 🎨 Frontend Structure

**Location:** `/frontend`

The frontend is built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**.

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard pages
│   │   ├── dashboard/     # Admin dashboard
│   │   └── users/         # User management
│   ├── doctor/            # Doctor dashboard pages
│   │   ├── dashboard/     # Doctor overview
│   │   ├── medical-records/ # Patient records
│   │   └── queue/         # Patient queue
│   ├── patient/           # Patient portal pages
│   │   ├── appointments/  # View appointments
│   │   ├── book-appointment/ # Book new appointment
│   │   ├── dashboard/     # Patient dashboard
│   │   └── queue/         # View queue status
│   ├── forgot-password/   # Password reset request
│   ├── login/             # Login page
│   ├── profile/           # User profile page
│   ├── register/          # Registration page
│   ├── reset-password/    # Password reset
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
│
├── components/            # Reusable React components
│   ├── Button.tsx         # Custom button component
│   ├── Card.tsx           # Card container
│   ├── ChangePasswordModal.tsx # Password change modal
│   ├── Input.tsx          # Form input component
│   ├── Navbar.tsx         # Navigation bar
│   ├── ProtectedRoute.tsx # Route protection wrapper
│   ├── Sidebar.tsx        # Dashboard sidebar
│   └── Toast.tsx          # Notification toasts
│
├── contexts/              # React Context providers
│   └── AuthContext.tsx    # Authentication context
│
├── services/              # API service layer
│   └── api.ts             # Axios configuration & API calls
│
├── styles/                # Global styles
│   └── globals.css        # Tailwind & global CSS
│
├── types/                 # TypeScript type definitions
│   └── index.ts           # Shared types
│
├── hooks/                 # Custom React hooks (empty - ready for use)
│
├── utils/                 # Utility functions (empty - ready for use)
│
├── public/                # Static assets
│
├── .env.local             # Environment variables
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Frontend dependencies
```

### Frontend Key Files

- **`app/`** - Next.js pages using the App Router pattern
- **`components/`** - Reusable UI components
- **`services/api.ts`** - Central API configuration with Axios
- **`contexts/AuthContext.tsx`** - Global authentication state
- **`styles/globals.css`** - Tailwind directives and global styles

---

## 🔧 Backend Structure

**Location:** `/backend`

The backend is built with **Node.js**, **Express**, and **MongoDB**.

```
backend/
├── routes/                # API route handlers
│   ├── appointments.js    # Appointment endpoints
│   ├── auth.js            # Authentication (login, register, password reset)
│   ├── doctors.js         # Doctor-specific endpoints
│   ├── medicalRecords.js  # Medical records CRUD
│   └── queue.js           # Queue management
│
├── models/                # Mongoose database models
│   ├── Appointment.js     # Appointment schema
│   ├── Department.js      # Department schema
│   ├── MedicalRecord.js   # Medical record schema
│   ├── Queue.js           # Queue schema
│   └── User.js            # User schema
│
├── middleware/            # Express middleware
│   └── auth.js            # JWT authentication & authorization
│
├── controllers/           # Business logic (empty - ready for use)
│
├── seedDoctors.js         # Script to seed doctor data
├── updateDoctors.js       # Script to update doctor info
├── server.js              # Express server entry point
├── .env                   # Environment variables
└── package.json           # Backend dependencies
```

### Backend Key Files

- **`server.js`** - Main Express server with Socket.IO
- **`routes/`** - RESTful API endpoints
- **`models/`** - MongoDB schemas using Mongoose
- **`middleware/auth.js`** - JWT verification and role-based access control

---

## 🗄️ Database Structure

**Location:** `/database`

Organized database-related files for easy reference and management.

```
database/
├── schemas/               # Database schemas (copied from backend/models)
│   ├── Appointment.js     # Appointment schema
│   ├── Department.js      # Department schema
│   ├── MedicalRecord.js   # Medical record schema
│   ├── Queue.js           # Queue schema
│   └── User.js            # User schema
│
├── seeders/               # Database seeding scripts
│   ├── seedDoctors.js     # Seed doctor accounts
│   └── updateDoctors.js   # Update doctor information
│
└── migrations/            # Database migrations (empty - ready for use)
```

### Database Information

- **Database:** MongoDB
- **ORM:** Mongoose
- **Connection:** Configured via `MONGODB_URI` in backend `.env`

---

## 🚀 Running the Application

### Quick Start (Recommended)

```bash
./start.sh
```

This script will:
1. Check if MongoDB is running
2. Start backend server on port 5001
3. Start frontend server on port 3000

### Manual Start

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

---

## 📝 Environment Variables

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
```

### Backend (`.env`)

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/mediflow
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

---

## 🔑 Key Features by Directory

### Frontend Features
- ✅ Role-based dashboards (Admin, Doctor, Patient)
- ✅ Authentication & authorization
- ✅ Appointment booking system
- ✅ Medical records management
- ✅ Real-time queue updates
- ✅ User profile management

### Backend Features
- ✅ RESTful API endpoints
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Socket.IO for real-time updates
- ✅ Email notifications
- ✅ Password reset functionality

### Database Features
- ✅ User management (patients, doctors, admin, staff)
- ✅ Appointment tracking
- ✅ Medical records storage
- ✅ Queue management
- ✅ Department organization

---

## 📦 Technology Stack

### Frontend
- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **State Management:** React Context API

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JWT
- **Real-time:** Socket.IO
- **Email:** Nodemailer

---

## 📚 Import Path Aliases

The frontend uses TypeScript path aliases for cleaner imports:

```typescript
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/Button';
import { authAPI } from '@/services/api';
import { User } from '@/types';
```

**Alias Configuration:**
- `@/` → Maps to frontend root directory
- Configured in `tsconfig.json`

---

## 🔄 API Communication

**Base URL:** `http://localhost:5001`

The frontend communicates with the backend through the `services/api.ts` file, which:
- Configures Axios with base URL
- Adds JWT token to all requests
- Handles 401 unauthorized responses
- Provides typed API methods

**Example:**
```typescript
import { authAPI } from '@/services/api';

const response = await authAPI.login({ email, password });
```

---

## 📖 Naming Conventions

- **Frontend:** React components use PascalCase (e.g., `Button.tsx`)
- **Backend:** Routes and models use PascalCase for models, camelCase for functions
- **Folders:** Use kebab-case for multi-word folders (e.g., `book-appointment`)
- **Files:** Use descriptive names matching their purpose

---

## 🎯 Best Practices

1. **Components** - Keep components small and focused
2. **Services** - All API calls go through `services/api.ts`
3. **Types** - Define TypeScript types in `types/index.ts`
4. **Styles** - Use Tailwind utility classes
5. **Authentication** - Use `useAuth()` hook for auth state
6. **Routes** - Protected routes use `ProtectedRoute` component

---

## 🆘 Need Help?

- **Frontend Issues:** Check `frontend/README.md`
- **Backend Issues:** Check backend logs in terminal
- **Database Issues:** Ensure MongoDB is running
- **Port Conflicts:** Backend uses 5001 (not 5000 due to macOS AirPlay)

---

## 📄 License

MediFlow Hospital Management System - Educational Project
