# MediFlow - Complete ERROR-FREE Setup Guide

**Last Updated:** April 5, 2026  
**Status:** ✅ FULLY OPERATIONAL & ERROR-FREE

---

## 🚀 Quick Start

### Start All Services
```bash
cd /Users/apple/Desktop/Medi_Flow
chmod +x start-all.sh
./start-all.sh
```

### Manual Start (if needed)
```bash
# Terminal 1: Backend
cd /Users/apple/Desktop/Medi_Flow/backend
npm start

# Terminal 2: Frontend
cd /Users/apple/Desktop/Medi_Flow/frontend
npm run dev
```

### Access Points
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5001
- **MongoDB:** mongodb://localhost:27017/mediflow

---

## 👤 Demo Login Credentials

| Role   | Email              | Password    |
|--------|-------------------|-----------|
| Admin  | admin@demo.com    | password123 |
| Patient| patient@demo.com  | password123 |
| Doctor | doctor@demo.com   | password123 |
| Staff  | staff@demo.com    | password123 |

---

## ⚙️ Environment Configuration

### Backend (.env)
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/mediflow
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=7d
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
```

---

## ✅ System Requirements

- **Node.js:** v18+
- **MongoDB:** Running on localhost:27017
- **npm:** v9+
- **Ports Available:** 3000 (frontend), 5001 (backend)

---

## 🔧 Common Issues & Solutions

### Issue: "Login error: {}"
**Solution:** 
- Verify backend is running on port 5001
- Check AuthContext.tsx for syntax errors
- Clear browser localStorage and cache
- Restart both frontend and backend

### Issue: Backend not responding
**Solution:**
```bash
# Kill any process on port 5001
lsof -i :5001 | grep -v PID | awk '{print $2}' | xargs kill -9

# Start backend
cd /Users/apple/Desktop/Medi_Flow/backend
npm start
```

### Issue: Frontend won't compile
**Solution:**
```bash
# Clear cache and reinstall
cd /Users/apple/Desktop/Medi_Flow/frontend
rm -rf .next node_modules
npm install
npm run dev
```

### Issue: MongoDB connection error
**Solution:**
```bash
# Start MongoDB
brew services start mongodb-community

# Verify connection
mongosh --eval "db.adminCommand('ping')"
```

### Issue: Port already in use
**Solution:**
```bash
# Find and kill process on specific port
lsof -i :PORT_NUMBER
kill -9 PID

# Or change the port in .env
PORT=5002  # Use different port
```

---

## 🔍 Verification Checklist

Run this to verify everything is working:

```bash
# Check MongoDB
mongosh --eval "db.adminCommand('ping')"  # Should return { ok: 1 }

# Check Backend
curl http://localhost:5001/  # Should return API message

# Check Login API
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@demo.com","password":"password123"}'
# Should return token and user object

# Check Frontend
curl -s http://localhost:3000 | head -1  # Should return <!DOCTYPE html>
```

---

## 📦 Dependencies Installed

### Backend
- express
- mongoose
- jsonwebtoken
- cors
- socket.io
- dotenv
- bcryptjs
- (and other packages in package.json)

### Frontend
- next@16.1.0
- react@19.2.3
- react-dom@19.2.3
- axios
- tailwindcss@4.1.18
- recharts@3.8.1
- lucide-react
- (and other packages in package.json)

---

## 🆕 New Enhanced Features

### AI Recommendations Panel
- 📊 28-day health trends visualization
- 🎯 Expandable action steps
- 📋 Goal-based health plans
- 📥 Download health reports
- 🚨 Advanced triage scoring
- 📈 Progress tracking

Location: `frontend/components/AIRecommendationsPanelEnhanced.tsx`

---

## 📝 Key Files Structure

```
/Users/apple/Desktop/Medi_Flow/
├── backend/
│   ├── server.js              # Main server entry
│   ├── .env                   # Backend configuration
│   ├── routes/                # API routes
│   ├── controllers/           # Business logic
│   ├── models/                # Database schemas
│   └── ai/                    # AI/ML modules
├── frontend/
│   ├── app/                   # Next.js app directory
│   ├── components/            # React components
│   ├── contexts/              # Auth & other contexts
│   ├── services/              # API services
│   ├── .env.local             # Frontend configuration
│   └── package.json
├── database/                  # DB migrations & seeds
└── docs/                      # Documentation
```

---

## 🐛 Debugging Tips

### Enable Debug Logging
```javascript
// In browser console
localStorage.setItem('debug', 'true');

// In backend (before requiring modules)
process.env.DEBUG = '*';
```

### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Login and observe requests
4. Check Console tab for errors

### Monitor Backend Logs
```bash
# Keep backend running in foreground to see logs
cd /Users/apple/Desktop/Medi_Flow/backend
npm start
```

### Check MongoDB Data
```bash
mongosh

# In mongosh console:
use mediflow
db.users.find()
db.appointments.find()
db.queue.find()
```

---

## 🚨 Error Messages Reference

| Error | Cause | Fix |
|-------|-------|-----|
| Cannot connect to backend | Backend not running | `npm start` in backend folder |
| Invalid credentials | Wrong password or no user | Use demo credentials or register |
| CORS error | API URL mismatch | Check .env.local NEXT_PUBLIC_API_URL |
| MongoDB connection error | DB not running | `brew services start mongodb-community` |
| Port already in use | Another process using port | Kill the process or change port |

---

## ✨ Testing Workflow

1. **Login Test**
   - Go to http://localhost:3000/login
   - Enter demo credentials
   - Should redirect to dashboard

2. **Appointments Test**
   - Navigate to Appointments page
   - Should see enhanced AI recommendations
   - Try booking an appointment

3. **AI Features Test**
   - View AI recommendations panel
   - Check health trends chart
   - Expand action steps

4. **API Test**
   - Use curl or Postman
   - Test `/api/auth/login` endpoint
   - Test `/api/appointments` endpoint

---

## 📞 Support

If you encounter any issues:

1. **Check logs** in terminal/console
2. **Verify ports** are available and services running
3. **Clear cache** (browser & next.js .next folder)
4. **Restart services** using start-all.sh
5. **Verify credentials** are correct

---

## 🔐 Security Notes

- ⚠️ Change JWT_SECRET in production
- ⚠️ Use environment variables for sensitive data
- ⚠️ Enable HTTPS in production
- ⚠️ Setup proper CORS policies
- ⚠️ Implement rate limiting
- ⚠️ Use secure password hashing

---

## 📚 Documentation

- `docs/API_DOCUMENTATION.md` - Complete API reference
- `docs/DATABASE_SCHEMA.md` - Database structure
- `docs/DEVELOPER_GUIDE.md` - Development guidelines
- `docs/DEPLOYMENT_GUIDE.md` - Production setup

---

## ✅ Final Checklist Before Launch

- [ ] MongoDB is running
- [ ] Backend is running on port 5001
- [ ] Frontend is running on port 3000
- [ ] Demo users are seeded
- [ ] Login works with demo credentials
- [ ] Can navigate to appointments page
- [ ] AI recommendations panel displays
- [ ] No console errors in browser DevTools
- [ ] No error logs in backend terminal
- [ ] .env and .env.local are configured correctly

---

**All errors fixed. Application is fully operational! 🎉**
