# 🔧 Network Error Fix Guide

## Problem: "Network Error: Cannot connect to backend at http://localhost:5000"

This error means the frontend cannot reach the backend server.

---

## ✅ Quick Fix (30 seconds)

### Step 1: Make sure MongoDB is running
```bash
# macOS with Homebrew
brew services start mongodb-community

# Linux
systemctl start mongod
```

### Step 2: Start Backend
```bash
cd backend
npm start
```
✅ Should show:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
```

### Step 3: Start Frontend (new terminal)
```bash
cd frontend
npm run dev
```
✅ Should show:
```
▲ Next.js 16.1.0
- Local: http://localhost:3000
```

### Step 4: Open http://localhost:3000

---

## 🚀 Automated Startup (1 command!)

Use the new startup script:

```bash
cd /Users/apple/Desktop/Medi_Flow
chmod +x start-all.sh
./start-all.sh
```

This script automatically:
- ✅ Checks MongoDB
- ✅ Starts backend on port 5000
- ✅ Starts frontend on port 3000
- ✅ Creates .env.local if needed
- ✅ Installs dependencies if needed
- ✅ Verifies everything is running

---

## 🔍 Troubleshooting

### Error: "Port 5000 already in use"
```bash
# Find what's using port 5000
lsof -i :5000

# Kill the process (replace PID with actual number)
kill -9 <PID>
```

### Error: "Cannot connect to MongoDB"
```bash
# Check if MongoDB is running
mongosh

# If not, start it
brew services start mongodb-community  # macOS
systemctl start mongod                 # Linux
```

### Error: "npm install fails"
```bash
# Clear npm cache and retry
npm cache clean --force
rm -rf node_modules
npm install
```

### Error: "Port 3000 already in use"
```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

---

## 📋 Configuration Checklist

✅ **Backend Environment Variables** (backend/.env):
```env
MONGODB_URI=mongodb://localhost:27017/medi_flow
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
```

✅ **Frontend Environment Variables** (frontend/.env.local):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## 🧪 Verify Setup

### Test Backend:
```bash
# Should return JSON with API status
curl http://localhost:5000/api/status/health
```

Expected response:
```json
{
  "success": true,
  "status": "running",
  "timestamp": "2026-04-04T..."
}
```

### Test Frontend:
```bash
# Should return HTML
curl http://localhost:3000 | head -20
```

### Test Connection:
Open browser and go to:
- http://localhost:3000 should load the app
- Try logging in with test credentials

---

## 🆘 Still Getting "Network Error"?

Run these diagnostics:

```bash
# 1. Check if ports are in use
echo "=== Port Check ==="
lsof -i :5000  # Backend
lsof -i :3000  # Frontend
lsof -i :27017 # MongoDB

# 2. Check if services are running
echo "=== Service Check ==="
ps aux | grep "node"     # Node processes
ps aux | grep "mongod"   # MongoDB

# 3. Test backend directly
echo "=== Backend Health ==="
curl -v http://localhost:5000/api/status/health

# 4. Check environment variables
echo "=== Frontend Config ==="
cd frontend && cat .env.local
```

---

## 📱 Using the App

1. **Register**: http://localhost:3000/register
2. **Login**: http://localhost:3000/login
3. **Patient Dashboard**: http://localhost:3000/patient/dashboard
4. **Doctor Dashboard**: http://localhost:3000/doctor/dashboard
5. **Admin Dashboard**: http://localhost:3000/admin/dashboard

---

## 💡 Pro Tips

1. **Run in separate terminals** - One for backend, one for frontend
2. **Check browser console** (F12) for detailed error messages
3. **Keep MongoDB running** - It must be running before backend starts
4. **Use the startup script** - It handles all the setup automatically

---

## 🆘 Need More Help?

1. **Check AUTH_TROUBLESHOOTING.md** for auth-specific issues
2. **Browser Console** (F12) shows detailed error messages
3. **Backend Logs** in terminal show what's happening
4. **GitHub Issues** for known problems

---

**Network Error should now be fixed! 🎉**

If still having issues, make sure:
1. ✅ MongoDB is running (`mongosh` should connect)
2. ✅ Backend is on port 5000 (`lsof -i :5000` shows node)
3. ✅ Frontend can see backend (`curl http://localhost:5000`)
4. ✅ Frontend environment variable is set correctly
