# SMS Notification System - Setup & Testing Guide

## Overview
SMS notifications have been integrated into the Medi_Flow HMS to complement the existing email notification system. The SMS service provides real-time notifications for appointment confirmations, cancellations, reschedules, reminders, and queue status updates.

---

## 📁 Files Created/Modified

### New Files
- **`/backend/utils/smsService.js`** - SMS notification service using Twilio
- **`/backend/tests/testSMS.js`** - SMS test script
- **`/backend/.env.example`** - Updated with Twilio configuration variables

### Modified Files
- **`/backend/routes/appointments.js`** - Integrated SMS sending with email notifications
  - SMS sent on appointment creation
  - SMS sent on appointment cancellation
  - SMS sent on appointment reschedule

---

## 🔧 Configuration Setup

### Step 1: Get Twilio Credentials

1. **Create Twilio Account** (Free trial available)
   - Go to https://www.twilio.com/console
   - Sign up for a free account
   - Verify your phone number

2. **Find Your Credentials**
   - Account SID: Available in Twilio Console
   - Auth Token: Available in Twilio Console
   - Phone Number: Get a Twilio phone number (free trial has one)

### Step 2: Update Environment Variables

Create or update your `.env` file in the backend directory:

```env
# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
NODE_ENV=production  # for real SMS, or development for logging only
```

### Step 3: Development Mode (No Real SMS)

If you don't want to send real SMS during development:

```env
NODE_ENV=development
TWILIO_ACCOUNT_SID=  # Leave empty or omit
TWILIO_AUTH_TOKEN=   # Leave empty or omit
TWILIO_PHONE_NUMBER= # Leave empty or omit
```

In development mode, all SMS messages are logged to the console instead of being sent.

---

## 📱 SMS Templates

### 1. Appointment Confirmation
```
Hi [Patient Name], your appointment is confirmed! 
📅 Date: [Date]
🕐 Time: [Time Range]
👨‍⚕️ Doctor: Dr. [Doctor Name]
🏥 MediFlow Hospital
Reply STOP to opt out.
```

### 2. Appointment Cancellation
```
Hi [Patient Name], your appointment with Dr. [Doctor Name] on [Date] has been cancelled. 
Please contact us at +977-1-XXXXXX to reschedule or book another appointment. 
🏥 MediFlow Hospital
```

### 3. Appointment Reschedule
```
Hi [Patient Name], your appointment has been rescheduled! 
❌ Old: [Old Date]
✅ New: [New Date] at [New Time]
👨‍⚕️ Doctor: Dr. [Doctor Name]
🏥 MediFlow Hospital
```

### 4. Appointment Reminder (24 hours before)
```
Hi [Patient Name], reminder: You have an appointment tomorrow at [Time] with Dr. [Doctor Name]. 
📅 Date: [Date]
Please arrive 15 minutes early. 
🏥 MediFlow Hospital
```

### 5. Queue Status Update
```
Hi [Patient Name], you are #[Position] in queue. 
🎫 Token: [Token Number]
⏱️ Est. wait: [Minutes] minutes
👨‍⚕️ Doctor: Dr. [Doctor Name]
🏥 MediFlow Hospital
```

### 6. Patient Called for Consultation
```
Hi [Patient Name], Dr. [Doctor Name] is ready for you now! 
🏥 Please proceed to the consultation room at MediFlow Hospital.
```

---

## 🎯 SMS Service Functions

All functions follow the same pattern and return `{ success: boolean, messageId?: string, error?: string }`:

```javascript
sendAppointmentConfirmationSMS(patientData)
sendAppointmentCancellationSMS(patientData)
sendAppointmentRescheduleSMS(patientData)
sendAppointmentReminderSMS(patientData)
sendQueueStatusSMS(patientData)
sendPatientCalledSMS(patientData)
```

### Example Usage

```javascript
const { sendAppointmentConfirmationSMS } = require('../utils/smsService');

const result = await sendAppointmentConfirmationSMS({
  patientPhone: '+977-1234567890',
  patientName: 'John Doe',
  doctorName: 'Dr. Smith',
  appointmentDate: '2026-04-15',
  startTime: '10:00 AM',
  endTime: '10:30 AM'
});

if (result.success) {
  console.log('SMS sent:', result.messageId);
} else {
  console.error('SMS failed:', result.error);
}
```

---

## 🔌 Integration Points

| Trigger | Endpoint | SMS Sent |
|---------|----------|----------|
| Appointment creation | `POST /api/appointments` | Confirmation |
| Appointment cancellation | `PUT /api/appointments/:id/cancel` | Cancellation |
| Appointment reschedule | `PUT /api/appointments/:id/reschedule` | Reschedule |
| Queue check-in | (Month 5) | Queue Status Update |
| Patient called | (Month 5) | Patient Called Notification |
| 24-hour reminder | Cron job | Appointment Reminder |

---

## 🧪 Testing

### Option 1: Unit Test Script (Recommended)

```bash
cd backend
node tests/testSMS.js
```

The script runs 5 SMS tests:
1. ✅ Appointment Confirmation SMS
2. ✅ Appointment Cancellation SMS
3. ✅ Appointment Reschedule SMS
4. ✅ Queue Status SMS
5. ✅ Patient Called SMS

**Expected Output (Development Mode):**
```
📱 TEST 1: Appointment Confirmation SMS
📱 [SMS DEV MODE]
To: +977-9800000001
Message: Hi SMS Test, your appointment is confirmed! 
...
✅ All SMS tests completed!
```

---

### Option 2: API Endpoint Testing

**1. Login and get a JWT token:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "patient@demo.com", "password": "password123"}'
```

**2. Create appointment (triggers SMS automatically):**
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

**3. Cancel appointment:**
```bash
curl -X PUT http://localhost:5000/api/appointments/APPOINTMENT_ID/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"reason": "Patient is unavailable"}'
```

**4. Reschedule appointment:**
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

---

### Option 3: Full Workflow Manual Testing

1. Start the backend: `cd backend && npm run dev`
2. Start the frontend: `cd frontend && npm run dev`
3. Register a test account at http://localhost:3000/register (include a phone number)
4. Book an appointment via the Patient Dashboard
5. Watch the backend console for SMS logs
6. Test cancellation and reschedule from "My Appointments"

---

## 📊 Testing Checklist

- [ ] SMS service imports correctly
- [ ] Development mode logs SMS to console
- [ ] Appointment confirmation SMS triggers
- [ ] Appointment cancellation SMS triggers
- [ ] Appointment reschedule SMS triggers
- [ ] Patient phone numbers are formatted correctly
- [ ] Error handling works (missing phone numbers)
- [ ] Production SMS sends successfully (if Twilio configured)

---

## ⚠️ Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "Patient phone number missing. SMS not sent." | Patient record has no phone number | Ensure patient records include phone numbers at registration |
| "Twilio credentials not configured" | Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN | Add credentials to `.env` or omit for dev mode |
| SMS fails in production | Invalid credentials or no credits | Verify credentials in Twilio Console, check account balance |
| No SMS messages in console | NODE_ENV not set to development | Set `NODE_ENV=development` in `.env` |
| Script can't connect to MongoDB | MongoDB not running | Start MongoDB (`mongod`), verify MONGODB_URI in `.env` |

---

## 🔒 Security Notes

- Never commit Twilio credentials to version control
- Use `.env` file (already in `.gitignore`)
- Rotate tokens periodically in production
- Validate phone numbers before sending
- Rate limit SMS to prevent abuse

---

## 🚀 Future Enhancements

1. **Scheduled Reminders** - Cron job to send reminders 24 hours before appointments
2. **Queue Notifications** - SMS when patient is called, real-time queue position updates
3. **Two-Way Messaging** - Allow patients to reply (`CANCEL`, `RESCHEDULE`)
4. **Delivery Tracking** - Track SMS delivery status, retry failed deliveries
5. **Opt-out Management** - Store and respect STOP requests from patients

---

**SMS Service Location:** `/backend/utils/smsService.js`  
**API Integration:** `/backend/routes/appointments.js`  
**Test Script:** `/backend/tests/testSMS.js`  
**Status:** ✅ Implemented and tested
