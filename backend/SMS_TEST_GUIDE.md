# SMS Integration Testing Guide

## 🧪 Testing Options

There are 3 ways to test the SMS integration:

1. **Unit Test Script** (Recommended for quick testing)
2. **API Endpoints** (Test via HTTP requests)
3. **Manual Testing** (Full workflow testing)

---

## Option 1: Unit Test Script ✅ RECOMMENDED

### Quick Setup

```bash
cd /Users/apple/Desktop/Medi_Flow/backend

# Run the SMS test script
node tests/testSMS.js
```

### What it Tests

The script runs 5 SMS tests:
1. ✅ Appointment Confirmation SMS
2. ✅ Appointment Cancellation SMS
3. ✅ Appointment Reschedule SMS
4. ✅ Queue Status SMS
5. ✅ Patient Called SMS

### Expected Output (Development Mode)

```
═══════════════════════════════════════════
   MediFlow SMS Integration Test Suite
═══════════════════════════════════════════

ℹ️  Environment: development
ℹ️  Node Version: v18.16.0
ℹ️  Setting up test users...
✅ Test patient created
✅ Test doctor created

ℹ️  Patient Phone: +977-9800000001
ℹ️  Doctor: Dr. Tester

🟢 DEVELOPMENT MODE: SMS messages will be logged to console

📱 TEST 1: Appointment Confirmation SMS
📱 [SMS DEV MODE]
To: +977-9800000001
Message: Hi SMS Test, your appointment is confirmed! 
📅 Date: Mar 31, 2026
🕐 Time: 10:00 AM - 10:30 AM
👨‍⚕️ Doctor: Dr. Tester
🏥 MediFlow Hospital
Reply STOP to opt out.
---

✅ Confirmation SMS sent (Mode: development)
ℹ️  Message ID: dev-mode

... [4 more tests] ...

═══════════════════════════════════════════
✅ All SMS tests completed!
═══════════════════════════════════════════
```

---

## Option 2: API Endpoint Testing

### Prerequisites

1. **Start Backend Server:**
```bash
cd /Users/apple/Desktop/Medi_Flow/backend
npm run dev
```

2. **Get Authentication Token:**

First, login to get a JWT token:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@demo.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

Copy the `token` value for the next requests.

---

### Test Case 1: Create Appointment (SMS Sent Automatically)

```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "doctor": "DOCTOR_ID_HERE",
    "appointmentDate": "2026-04-10",
    "startTime": "10:00 AM",
    "endTime": "10:30 AM",
    "reason": "General Checkup",
    "type": "consultation"
  }'
```

**What Happens:**
- Appointment created ✅
- Confirmation Email sent ✅
- Confirmation SMS sent ✅ (Watch backend console)

**Expected Backend Log:**
```
📱 [SMS DEV MODE]
To: +977-1234567890
Message: Hi John Doe, your appointment is confirmed! 
📅 Date: Apr 10, 2026
🕐 Time: 10:00 AM - 10:30 AM
👨‍⚕️ Doctor: Dr. Smith
🏥 MediFlow Hospital
Reply STOP to opt out.
---
```

---

### Test Case 2: Cancel Appointment (SMS Sent Automatically)

```bash
curl -X PUT http://localhost:5000/api/appointments/APPOINTMENT_ID/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "reason": "Patient is unavailable"
  }'
```

**Expected Backend Log:**
```
📱 [SMS DEV MODE - Cancellation]
To: +977-1234567890
Message: Hi John Doe, your appointment with Dr. Smith on Apr 10, 2026 has been cancelled. 
Please contact us at +977-1-XXXXXX to reschedule or book another appointment. 
🏥 MediFlow Hospital
---
```

---

### Test Case 3: Reschedule Appointment (SMS Sent Automatically)

```bash
curl -X PUT http://localhost:5000/api/appointments/APPOINTMENT_ID/reschedule \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "appointmentDate": "2026-04-15",
    "startTime": "2:00 PM",
    "endTime": "2:30 PM",
    "reason": "Doctor suggested new time"
  }'
```

**Expected Backend Log:**
```
📱 [SMS DEV MODE - Reschedule]
To: +977-1234567890
Message: Hi John Doe, your appointment has been rescheduled! 
❌ Old: Apr 10, 2026
✅ New: Apr 15, 2026 at 2:00 PM - 2:30 PM
👨‍⚕️ Doctor: Dr. Smith
🏥 MediFlow Hospital
---
```

---

## Option 3: Full Workflow Manual Testing

### Step 1: Start the application

**Terminal 1 - Backend:**
```bash
cd /Users/apple/Desktop/Medi_Flow/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd /Users/apple/Desktop/Medi_Flow/frontend
npm run dev
```

### Step 2: Create Test Account

1. Go to http://localhost:3000/register
2. Fill in the form with:
   - **Email**: smstest@example.com
   - **Password**: Test@123
   - **Phone**: +977-9800000099 (or your actual phone)
   - **Role**: Patient
3. Click Register

### Step 3: Book Appointment

1. Login with your test account
2. Go to Patient Dashboard → Book Appointment
3. Select a doctor and time
4. Click "Book Appointment"

**Watch Backend Console:**
```
✅ Email sent: message_id_123
📱 [SMS DEV MODE]
To: +977-9800000099
Message: Hi Test User, your appointment is confirmed! 
...
```

### Step 4: Test Cancellation

1. Go to "My Appointments"
2. Click "Cancel" on an appointment
3. Watch backend console for SMS log

### Step 5: Test Reschedule

1. Go to "My Appointments"
2. Click "Reschedule" on an appointment
3. Select new date/time
4. Watch backend console for SMS log

---

## 🔧 Environment Configuration for Testing

### Development Mode (No Real SMS)

**`.env` file:**
```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mediflow
JWT_SECRET=test_secret_key
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=ethereal.user@ethereal.email
EMAIL_PASS=ethereal.password

# Leave Twilio credentials empty or commented out for dev mode
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_PHONE_NUMBER=
```

**Run:**
```bash
npm run dev
```

All SMS messages will be **logged to console** only.

---

### Production Mode (Real Twilio SMS)

**`.env` file:**
```env
NODE_ENV=production
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

**Get Twilio Credentials:**

1. Go to https://www.twilio.com/console
2. Sign up for free account (free trial includes SMS credits)
3. Get your Account SID and Auth Token
4. Get a Twilio phone number
5. Copy credentials to `.env`

**Run:**
```bash
NODE_ENV=production npm run dev
```

Real SMS messages will be **sent via Twilio**.

---

## 📊 Testing Checklist

### Unit Test Script
- [ ] Run `node tests/testSMS.js`
- [ ] All 5 tests show success message
- [ ] SMS messages logged to console
- [ ] No errors in output

### API Testing
- [ ] Login returns valid token
- [ ] Create appointment triggers SMS
- [ ] Cancel appointment triggers SMS
- [ ] Reschedule appointment triggers SMS
- [ ] SMS contains correct patient name
- [ ] SMS contains correct doctor name
- [ ] SMS contains correct appointment details

### Manual Testing
- [ ] Register new account
- [ ] Book appointment → SMS in console
- [ ] Cancel appointment → SMS in console
- [ ] Reschedule appointment → SMS in console
- [ ] Check all SMS messages contain correct info

---

## 🐛 Troubleshooting

### Issue: Script fails to connect to MongoDB

**Solution:**
```bash
# Ensure MongoDB is running
mongod

# Check connection string in .env
MONGODB_URI=mongodb://localhost:27017/mediflow
```

### Issue: No SMS messages in console

**Ensure:**
```bash
# NODE_ENV is set to development
NODE_ENV=development node tests/testSMS.js

# Or check in running server
npm run dev  # Should log SMS to console
```

### Issue: SMS test creates duplicate users

**Solution:**
```bash
# The script checks for existing users first
# Just re-run, it will use existing users
node tests/testSMS.js
```

### Issue: Twilio SMS not sending in production

**Check:**
1. Account SID and Auth Token are correct
2. Twilio phone number is valid
3. Account has SMS credits (free trial includes $15)
4. Phone number has correct international format (+977...)

---

## 📈 Success Indicators

✅ **Development Mode:**
- SMS messages logged to console
- Messages contain correct patient/doctor names
- Messages contain correct appointment details
- No errors thrown

✅ **Production Mode:**
- SMS sent successfully to phone number
- Twilio message SID returned
- Patient receives SMS on their phone

---

## 🎯 Next Steps

After successful testing:

1. **Integrate with Queue System** (Month 5)
   - Send SMS when patient is called
   - Send real-time queue position updates

2. **Schedule Reminders** (Month 5)
   - Cron job to send SMS 24 hours before appointment
   - Automatic reminder SMS dispatch

3. **Two-Way Messaging** (Future)
   - Allow patients to reply to SMS
   - SMS commands for cancellation/rescheduling

---

## 📞 Support

**SMS Service Location:** `/backend/utils/smsService.js`
**API Integration:** `/backend/routes/appointments.js`
**Test Script:** `/backend/tests/testSMS.js`

For issues:
- Check backend console logs
- Verify MongoDB is running
- Verify environment variables
- Review SMS_SETUP_GUIDE.md for configuration
