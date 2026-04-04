# 🔧 Auth Troubleshooting Guide

## Common Login/Signup Issues & Solutions

### Issue 1: Login/Signup Not Working - Network Error ❌
**Problem:** Getting network error or "Cannot connect to API"

**Solution:**
Make sure backend is running on port **5000**:
```bash
cd backend
npm start
# ✅ Should show: "🚀 Server running on port 5000"
```

Frontend connects to port 5000 (fixed from port 5001).

---

### Issue 2: Account Created But Can't Login ❌
**Problem:** Registration succeeds but login fails

**Solution:**
1. Check MongoDB is running and connected
```bash
# macOS with Homebrew
brew services status mongodb-community

# Linux
systemctl status mongod
```

2. Verify database credentials in `.env`:
```bash
cd backend
cat .env | grep MONGODB
```

---

### Issue 3: "Invalid response from server" Error ❌
**Problem:** Server responds but data is malformed

**Root Cause:** Fixed in AuthContext.tsx
- Backend `/api/auth/me` returns `{ success: true, data: user }`
- Frontend was looking for `{ success: true, user: user }`

**Status:** ✅ FIXED - Updated to use `response.data.data`

---

### Issue 4: Port Mismatch (MAIN ISSUE) 🔴
**Problem:** Frontend requests fail silently

**Root Cause:** 
```
Frontend was calling: http://localhost:5001 ❌
Backend actually runs: http://localhost:5000 ✅
```

**Status:** ✅ FIXED - Updated `frontend/services/api.ts` to use port 5000

---

## ✅ Quick Verification Checklist

Run these commands to verify setup:

```bash
# 1. Check Backend Port
echo "Backend Port Check:"
curl -s http://localhost:5000/api/health | head -20

# 2. Check MongoDB Connection
echo "MongoDB Check:"
mongosh --eval "db.adminCommand('ping')"

# 3. Test Backend Login Endpoint
echo "Backend Login Test:"
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234"}'

# 4. Test Frontend Connection
echo "Frontend Connection:"
curl -s http://localhost:3000 | grep -i "<!DOCTYPE"
```

---

## 🚀 Complete Setup Steps

### Step 1: Start Backend
```bash
cd backend
npm install  # if not done
npm start
```
✅ Output should show:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
```

### Step 2: Start Frontend
```bash
cd frontend
npm install  # if not done
npm run dev
```
✅ Output should show:
```
▲ Next.js 16.1.0 (Turbopack)
- Local:         http://localhost:3000
```

### Step 3: Test Login
1. Open browser: http://localhost:3000
2. Click "Register" or "Login"
3. Use test credentials or create new account

---

## 📝 Test Account (if seeded)

Check if your database has test users:
```bash
cd backend
npm run seedDemoUsers  # if this script exists
```

Or create one manually via register page.

---

## 🐛 Debug Mode

### Enable Console Logging
Check browser console (F12) for detailed error messages:
- Login errors show exact API response
- Network tab shows API calls to correct port

### Backend Logs
Terminal should show:
```
❌ Failed to load user: [error details]
Login error: [specific error message]
```

---

## 📞 Still Not Working?

Run these diagnostics:

```bash
# Check if ports are in use
lsof -i :5000   # Backend port
lsof -i :3000   # Frontend port
lsof -i :27017  # MongoDB port

# Check network connectivity
curl http://localhost:5000/api/auth/me  # Should fail with 401 (no token)
curl http://localhost:3000              # Should return HTML

# Check MongoDB
mongosh
> show databases
> use medi_flow
> db.users.count()
```

---

## Key Fixes Applied ✅

1. **Port Mismatch Fixed**
   - Changed: `http://localhost:5001` → `http://localhost:5000`
   - File: `frontend/services/api.ts`

2. **Response Structure Fixed**
   - Backend returns: `{ success, data: user }`
   - Frontend now uses: `response.data.data`
   - Files: `frontend/contexts/AuthContext.tsx`

3. **Error Handling Improved**
   - Added validation for token/user in response
   - Added console logging for debugging
   - Files: `frontend/contexts/AuthContext.tsx`

4. **Environment Configuration**
   - Created: `frontend/.env.example`
   - Shows proper API_URL configuration

---

**Login/Signup should now work! 🎉**

If still having issues, check browser console (F12) for specific error messages.
