# 🚀 MediFlow - Quick Reference Guide for Testing & Deployment

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Running Tests](#running-tests)
3. [Deployment](#deployment)
4. [Troubleshooting](#troubleshooting)
5. [Important Commands](#important-commands)

---

## 🚀 Quick Start

### 1️⃣ Setup Backend
```bash
cd /Users/apple/Desktop/Medi_Flow/backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env  # Edit with your settings

# Start server
npm start
# ✅ Server running at http://localhost:5000
```

### 2️⃣ Setup Frontend
```bash
cd /Users/apple/Desktop/Medi_Flow/frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
nano .env.local  # Ensure API_URL points to backend

# Start development server
npm run dev
# ✅ Frontend running at http://localhost:3000
```

### 3️⃣ Verify Installation
```bash
# Check backend health
curl http://localhost:5000/api

# Check login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Check if frontend loads
open http://localhost:3000
```

---

## 🧪 Running Tests

### All Endpoint Tests (Comprehensive)
```bash
cd /Users/apple/Desktop/Medi_Flow/backend

# Run all 14 endpoint tests
node tests/testAllEndpoints.js

# Expected output: 14/14 tests passing ✅
```

### NLP Endpoint Tests (Specific)
```bash
cd /Users/apple/Desktop/Medi_Flow/backend

# Test NLP endpoints only
node tests/testNLPEndpoint.js

# Expected output: 5 test cases passing ✅
```

### Integration Testing Guide
```bash
cd /Users/apple/Desktop/Medi_Flow/backend

# View manual testing checklist
node tests/integrationTestGuide.js

# Follow the step-by-step guide for comprehensive integration testing
```

### What Tests Check ✅

#### NLP Endpoints
- ✅ Medical entity extraction
- ✅ Symptom analysis
- ✅ Intent recognition
- ✅ Urgency detection
- ✅ Department recommendations

#### Recommendations Endpoints
- ✅ Health score calculation
- ✅ Personalized recommendations
- ✅ Action plan generation
- ✅ Risk assessment
- ✅ Lifestyle guidance

---

## 🌍 Deployment

### Option A: Local Development
```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
cd frontend && npm run dev

# Access: http://localhost:3000
```

### Option B: Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build

# Access: http://localhost:3000
# API: http://localhost:5000/api
```

### Option C: Production Deployment

#### 1. Prepare Environment
```bash
# Copy production config
cp DEPLOYMENT_CONFIG.md deployment/config.md

# Set production environment variables
export NODE_ENV=production
export JWT_SECRET=your-secret-key
export MONGODB_URI=your-mongodb-uri
```

#### 2. Build for Production
```bash
# Backend
cd backend
npm install --production
npm run build  # if applicable

# Frontend
cd frontend
npm install --production
npm run build
```

#### 3. Deploy with PM2
```bash
npm install -g pm2

# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'medi-flow-backend',
      script: './backend/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    },
    {
      name: 'medi-flow-frontend',
      script: 'npm start',
      cwd: './frontend'
    }
  ]
};
EOF

# Start services
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### 4. Configure Web Server (Nginx)
```bash
# Create nginx config (see DEPLOYMENT_CONFIG.md for full config)
sudo nano /etc/nginx/sites-available/medi-flow

# Enable site
sudo ln -s /etc/nginx/sites-available/medi-flow /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

#### 5. Setup SSL Certificate
```bash
# Using Let's Encrypt
sudo apt-get install certbot
sudo certbot certonly --nginx -d yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

---

## 🐛 Troubleshooting

### Issue: Backend Won't Start
```bash
# Check Node version
node --version  # Should be v18+

# Check if port 5000 is in use
lsof -i :5000

# Kill existing process if needed
kill -9 <PID>

# Check MongoDB connection
mongosh  # Or mongo shell

# Restart with debug logging
DEBUG=* npm start
```

### Issue: Frontend Can't Connect to Backend
```bash
# Check backend is running
curl http://localhost:5000/api

# Verify CORS is enabled
# In backend/server.js, ensure:
app.use(cors());

# Check frontend .env.local
cat frontend/.env.local
# NEXT_PUBLIC_API_URL should be http://localhost:5000/api

# Check network requests in DevTools (F12)
```

### Issue: Tests Failing
```bash
# Check test prerequisites
# 1. Backend must be running
npm start  # in backend terminal

# 2. Database must be accessible
mongosh  # or test connection

# 3. Re-run tests
node backend/tests/testAllEndpoints.js

# 4. Check detailed errors
npm test -- --verbose
```

### Issue: Database Connection Error
```bash
# Verify MongoDB running
mongosh

# Check connection string in .env
cat backend/.env | grep MONGODB_URI

# Test connection directly
node -e "require('mongoose').connect(process.env.MONGODB_URI)"

# Common fixes
# - Ensure MongoDB is running: sudo systemctl start mongod
# - Check username/password
# - Verify database name in URI
# - Check network access/firewall rules
```

### Issue: Performance Problems
```bash
# Check API response time
time curl http://localhost:5000/api/recommendations/health-score \
  -H "Authorization: Bearer your_token"

# Monitor processes
top  # or Activity Monitor on macOS

# Check database query performance
# In MongoDB:
db.setProfilingLevel(1)  # Enable profiling
db.system.profile.find().pretty()  # View slow queries

# Optimize with indexes
db.users.createIndex({ email: 1 })
db.appointments.createIndex({ doctor: 1, date: 1 })
```

---

## 📝 Important Commands

### Backend Commands
```bash
cd /Users/apple/Desktop/Medi_Flow/backend

# Start development server
npm start

# Start with nodemon (auto-reload)
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Build for production
npm run build
```

### Frontend Commands
```bash
cd /Users/apple/Desktop/Medi_Flow/frontend

# Start development server
npm run dev

# Build for production
npm run build

# Start production build
npm start

# Lint/format code
npm run lint
npm run format

# Type check
npm run type-check
```

### Database Commands
```bash
# Connect to MongoDB
mongosh

# List databases
show dbs

# Select database
use medi_flow

# Show collections
show collections

# Query users
db.users.find().pretty()

# Create index
db.users.createIndex({ email: 1 })

# Backup database
mongodump --uri="mongodb://..." --out=./backup

# Restore database
mongorestore --uri="mongodb://..." ./backup
```

### Docker Commands
```bash
# Build containers
docker-compose build

# Start containers
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop containers
docker-compose down

# Remove all containers and volumes
docker-compose down -v
```

---

## 📚 Documentation References

| Document | Purpose | Location |
|----------|---------|----------|
| **API Documentation** | Complete endpoint reference | `MONTH_6_API_DOCUMENTATION.md` |
| **Deployment Guide** | Production setup & config | `DEPLOYMENT_CONFIG.md` |
| **Testing Guide** | QA & testing procedures | `TESTING_AND_QA_GUIDE.md` |
| **Completion Report** | Project summary | `MONTH_6_COMPLETION.md` |
| **Final Summary** | Comprehensive overview | `FINAL_SUMMARY_REPORT.md` |

---

## ✅ Pre-Launch Checklist

Before deploying to production, verify:

### Backend
- [ ] All 14 endpoints tested and working
- [ ] Environment variables configured
- [ ] MongoDB connected and healthy
- [ ] JWT secret changed from default
- [ ] CORS origins configured
- [ ] Error logging enabled
- [ ] Rate limiting configured
- [ ] Database indexes created

### Frontend
- [ ] Environment variables set correctly
- [ ] API_URL points to backend
- [ ] All pages load without errors
- [ ] Responsive design verified
- [ ] No console errors in DevTools
- [ ] Authentication flow works
- [ ] API calls successful

### Security
- [ ] SSL/TLS certificate installed
- [ ] Security headers configured
- [ ] Input validation enabled
- [ ] SQL injection prevention active
- [ ] XSS protection enabled
- [ ] CORS properly configured
- [ ] Secrets not committed to repo

### Performance
- [ ] API response time < 2s
- [ ] Frontend load time < 3s
- [ ] Database queries optimized
- [ ] Caching configured
- [ ] CDN for static assets

### Monitoring
- [ ] Error tracking (Sentry) enabled
- [ ] Application logging active
- [ ] Performance monitoring set up
- [ ] Alerts configured
- [ ] Backup automation active

---

## 🎯 Success Criteria

Your deployment is successful when:

✅ **Endpoints Working**
- All 14 API endpoints respond correctly
- Health check: `curl http://backend/api` returns 200
- Test script shows 14/14 passing

✅ **Frontend Working**  
- Homepage loads at `http://localhost:3000`
- Can log in with valid credentials
- Can navigate all pages without errors

✅ **Integration Working**
- Frontend successfully calls backend APIs
- data displays correctly on pages
- Real-time updates working
- No CORS errors in console

✅ **Performance Acceptable**
- Pages load in < 3 seconds
- API responds in < 2 seconds
- No excessive memory usage
- CPU usage reasonable

✅ **Security Verified**
- Cannot access endpoints without auth token
- HTTPS working in production
- Security headers present
- No sensitive data in logs

---

## 📞 Support

### Need Help?
1. Check **TESTING_AND_QA_GUIDE.md** for troubleshooting
2. Review **DEPLOYMENT_CONFIG.md** for environment issues
3. Check **MONTH_6_API_DOCUMENTATION.md** for API questions
4. Run `node backend/tests/integrationTestGuide.js` for manual testing steps

### Common Issues
- **Port in use:** `lsof -i :5000` and kill if needed
- **MongoDB not running:** `mongod` or `brew services start mongodb-community`
- **Missing dependencies:** `npm install` in both backend and frontend
- **Environment variables:** Copy `.env.example` to `.env` and configure

---

## 🚀 Ready to Deploy?

### Quick Deployment Summary
```bash
# 1. Setup
source setup.sh  # Configure everything

# 2. Test
node backend/tests/testAllEndpoints.js  # Verify all endpoints

# 3. Deploy
docker-compose up -d  # Or follow production deployment guide

# 4. Verify
curl http://localhost:5000/api  # Check backend
open http://localhost:3000  # Check frontend

# 5. Monitor
pm2 logs  # Watch logs
pm2 monit  # Monitor performance
```

**Status:** ✅ **PRODUCTION READY**

Deploy with confidence!

---

**Last Updated:** March 30, 2026  
**Version:** 1.0.0  
**Status:** Production Ready
