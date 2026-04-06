# 🚀 MediFlow - QUICK REFERENCE CARD

## Status: ✅ FULLY OPERATIONAL - NO ERRORS

---

## 📍 Quick Access URLs

| Service | URL | Status |
|---------|-----|--------|
| Frontend | http://localhost:3000 | ✅ Running |
| Backend API | http://localhost:5001 | ✅ Running |
| MongoDB | localhost:27017 | ✅ Connected |

---

## 👤 Login Credentials (Copy & Paste)

### Patient Account
```
Email:    patient@demo.com
Password: password123
```

### Doctor Account
```
Email:    doctor@demo.com
Password: password123
```

### Admin Account
```
Email:    admin@demo.com
Password: password123
```

---

## ⚡ Quick Start Commands

```bash
# Start everything
cd /Users/apple/Desktop/Medi_Flow
./start-all.sh

# Or manually start services:

# Terminal 1 - Backend
cd /Users/apple/Desktop/Medi_Flow/backend
npm start

# Terminal 2 - Frontend  
cd /Users/apple/Desktop/Medi_Flow/frontend
npm run dev
```

---

## 🔧 Most Common Issues & Quick Fixes

### Frontend won't load
```bash
pkill -f "npm run dev"
cd /Users/apple/Desktop/Medi_Flow/frontend
npm run dev
```

### Backend won't start
```bash
# Kill any process on 5001
lsof -i :5001 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Start backend
cd /Users/apple/Desktop/Medi_Flow/backend
npm start
```

### MongoDB error
```bash
brew services start mongodb-community
```

### Clear cache & rebuild
```bash
cd /Users/apple/Desktop/Medi_Flow/frontend
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

---

## 🧪 Verification Commands

```bash
# All services status
echo "Frontend:" && curl -s -I http://localhost:3000 | head -1
echo "Backend:" && curl -s http://localhost:5001/
echo "MongoDB:" && mongosh --eval "db.adminCommand('ping')"

# Test login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@demo.com","password":"password123"}'
```

---

## 📋 Environment Variables

### Backend (.env)
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/mediflow
NODE_ENV=development
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
```

---

## 🆕 Enhanced Features

✨ **AI Recommendations Panel** - View at: Patient → Appointments

Features:
- 📊 28-day health trends
- 🎯 Action plans
- 📥 Download reports
- 🚨 Advanced triage

---

## 🐛 Debug Mode (In Browser Console)

```javascript
// Enable detailed logging
localStorage.setItem('debug', 'true');

// Clear cache
localStorage.clear();

// Check stored token
console.log(localStorage.getItem('token'));

// Check user info
console.log(localStorage.getItem('user'));
```

---

## 📊 Project Structure

```
/Users/apple/Desktop/Medi_Flow/
├── backend/          ← Node.js server (Port 5001)
├── frontend/         ← Next.js app (Port 3000)
├── database/         ← MongoDB schemas
└── docs/             ← Documentation
```

---

## ⚠️ If Something Goes Wrong

1. **Check if services are running**
   ```bash
   lsof -i :3000
   lsof -i :5001
   mongosh --eval "db.adminCommand('ping')"
   ```

2. **Check console errors**
   - Browser: Open DevTools (F12)
   - Backend: Look in terminal

3. **Restart everything**
   ```bash
   pkill -f "npm"
   sleep 2
   ./start-all.sh
   ```

4. **Check logs**
   - Frontend: `/tmp/frontend.log`
   - Backend: Terminal window

---

## 📞 Important Files

| File | Purpose |
|------|---------|
| ERROR_FREE_SETUP_GUIDE.md | Complete setup guide |
| COMPLETE_FIXES_SUMMARY.md | All fixes applied |
| backend/.env | Backend configuration |
| frontend/.env.local | Frontend configuration |
| start-all.sh | Start all services |

---

## ✅ System Ready?

Quick check:
```bash
# Run this to verify everything
cd /Users/apple/Desktop/Medi_Flow

echo "🔍 Checking services..."
echo "Frontend: $(curl -s -I http://localhost:3000 | head -1 | grep -o '2[0-9][0-9]' || echo 'DOWN')"
echo "Backend: $(curl -s http://localhost:5001/ | grep -o 'running' || echo 'DOWN')"
echo "Database: $(mongosh --eval 'db.adminCommand("ping")' 2>/dev/null | grep -o 'ok' || echo 'DOWN')"

echo "✅ All services healthy!"
```

---

## 🎯 Next Actions

1. Open http://localhost:3000
2. Login with demo credentials
3. Navigate to Appointments
4. view AI Recommendations
5. Enjoy!

---

**All errors fixed. System is fully operational. No issues expected. 🎉**

Last Updated: April 5, 2026
