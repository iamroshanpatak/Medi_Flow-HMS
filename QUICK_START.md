# 🚀 Quick Start Guide - MediFlow

## Prerequisites
- Node.js (v18 or higher)
- MongoDB installed and running
- npm or yarn

## Installation Steps

### 1. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 2. Start MongoDB

Make sure MongoDB is running:
```bash
# macOS (if installed via Homebrew)
brew services start mongodb-community

# Or run directly
mongod
```

### 3. Start the Application

**Terminal 1 - Start Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Start Frontend:**
```bash
cd client
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🎯 What to Test

### 1. Landing Page
- Visit http://localhost:3000
- View the modern hero section and features

### 2. User Registration
- Click "Sign Up" or go to http://localhost:3000/register
- Fill in the registration form
- Submit and observe automatic login

### 3. User Login
- Go to http://localhost:3000/login
- Use demo credentials or your registered account
- Observe redirect to role-based dashboard

### 4. Demo Credentials
```
Patient:
Email: patient@demo.com
Password: password123

Doctor:
Email: doctor@demo.com
Password: password123

Admin:
Email: admin@demo.com
Password: password123
```

### 5. Explore Dashboards

**Patient Dashboard** (http://localhost:3000/patient/dashboard)
- View appointments
- Check queue status
- Access medical records

**Doctor Dashboard** (http://localhost:3000/doctor/dashboard)
- View today's schedule
- Manage patient queue
- Access patient information

**Admin Dashboard** (http://localhost:3000/admin/dashboard)
- View system statistics
- Monitor departments
- Access admin controls

### 6. Test Profile Management
- Login as any user
- Navigate to `/profile`
- Update your information
- Verify changes are saved

### 7. Test Admin Features (Admin only)
- Login as admin
- Navigate to `/admin/users`
- Search and filter users
- View user statistics

## 🔐 Security Features

- JWT token authentication
- Protected routes with role-based access
- Automatic token refresh
- Secure password hashing (bcrypt)
- Auto-logout on unauthorized access

## 📱 Responsive Design

The application is fully responsive:
- **Mobile**: Optimized for small screens
- **Tablet**: Adapted layout for medium screens
- **Desktop**: Full-featured interface

## 🎨 Features Implemented

### Month 1 ✅
- Base project setup
- Database models
- Backend API
- Frontend UI components
- Initial dashboards

### Month 2 ✅
- Authentication system
- Protected routes
- Profile management
- Admin user management
- Type safety improvements

### Coming in Month 3 🔄
- Appointment booking
- Doctor availability
- Appointment management
- Email notifications

## 🛠️ Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB
mongod --dbpath /path/to/data/db
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Module Not Found Errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentation

- [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) - Month 1 completion details
- [MONTH_2_COMPLETE.md](./MONTH_2_COMPLETE.md) - Month 2 completion details
- [README.md](./README.md) - Full project documentation

## 🎉 Next Steps

1. **Explore the application**: Test all features
2. **Customize**: Modify colors, layouts, text
3. **Extend**: Add new features based on requirements
4. **Deploy**: Ready for deployment to production

Happy Coding! 🚀
