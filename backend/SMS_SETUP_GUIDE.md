# SMS Notification System Implementation

## Overview
SMS notifications have been integrated into the Medi_Flow HMS to complement the existing email notification system. The SMS service provides real-time notifications for appointment confirmations, cancellations, reschedules, reminders, and queue status updates.

---

## 📁 Files Created/Modified

### New Files:
- **`/backend/utils/smsService.js`** - SMS notification service using Twilio
- **`/backend/.env.example`** - Updated with Twilio configuration variables

### Modified Files:
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

### Step 3: For Development (No Real SMS)

If you don't want to send real SMS during development:

```env
NODE_ENV=development
TWILIO_ACCOUNT_SID=  # Leave empty or omit
TWILIO_AUTH_TOKEN=   # Leave empty or omit
TWILIO_PHONE_NUMBER= # Leave empty or omit
```

In development mode, all SMS messages will be logged to the console instead of being sent.

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

### Available Functions

All functions follow the same pattern and return `{ success: boolean, messageId?: string, error?: string }`:

```javascript
// Appointment Confirmations
sendAppointmentConfirmationSMS(patientData)

// Appointment Cancellations
sendAppointmentCancellationSMS(patientData)

// Appointment Reschedule
sendAppointmentRescheduleSMS(patientData)

// Appointment Reminders
sendAppointmentReminderSMS(patientData)

// Queue Status
sendQueueStatusSMS(patientData)

// Patient Called
sendPatientCalledSMS(patientData)
```

### Example Usage

```javascript
const { sendAppointmentConfirmationSMS } = require('../utils/smsService');

// Send SMS
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

### 1. Appointment Creation (`POST /api/appointments`)
- **When**: After appointment is successfully created
- **SMS Sent**: Appointment Confirmation
- **Trigger**: Patient confirms booking

### 2. Appointment Cancellation (`PUT /api/appointments/:id/cancel`)
- **When**: After appointment status changes to 'cancelled'
- **SMS Sent**: Appointment Cancellation
- **Trigger**: Patient, doctor, or admin cancels appointment

### 3. Appointment Reschedule (`PUT /api/appointments/:id/reschedule`)
- **When**: After appointment is successfully rescheduled
- **SMS Sent**: Appointment Reschedule
- **Trigger**: Patient, doctor, or admin reschedules appointment

### 4. Queue Check-in (Planned for Month 5)
- **SMS Sent**: Queue Status Update
- **Function**: `sendQueueStatusSMS()`

### 5. Patient Called (Planned for Month 5)
- **SMS Sent**: Patient Called Notification
- **Function**: `sendPatientCalledSMS()`

### 6. Appointment Reminders (Planned for Month 5)
- **SMS Sent**: Appointment Reminder (24 hours before)
- **Function**: `sendAppointmentReminderSMS()`
- **Implementation**: Using Node cron job

---

## 🧪 Testing SMS

### Development Mode (No Real SMS)
```bash
# Ensure NODE_ENV=development in .env
NODE_ENV=development node server.js

# Create an appointment
# Check console logs for SMS messages
```

**Console Output Example:**
```
📱 [SMS DEV MODE]
To: +977-1234567890
Message: Hi John Doe, your appointment is confirmed! 
📅 Date: Apr 15, 2026
🕐 Time: 10:00 AM - 10:30 AM
👨‍⚕️ Doctor: Dr. Smith
🏥 MediFlow Hospital
Reply STOP to opt out.
---
```

### Production Mode (Real SMS via Twilio)
```bash
# Update .env with Twilio credentials
NODE_ENV=production node server.js

# Create an appointment
# SMS will be sent to the patient's phone number
```

---

## 📊 Testing Checklist

- [ ] SMS service imports correctly
- [ ] Development mode logs SMS to console
- [ ] Appointment confirmation SMS triggers
- [ ] Appointment cancellation SMS triggers
- [ ] Appointment reschedule SMS triggers
- [ ] SMS metadata (token, position) is correct
- [ ] Patient phone numbers are formatted correctly
- [ ] Error handling works (missing phone numbers)
- [ ] Twilio credentials are validated
- [ ] Production SMS sends successfully

---

## ⚠️ Error Handling

### Common Issues & Solutions

**Issue**: "Patient phone number missing. SMS not sent."
- **Cause**: Patient record doesn't have a phone number
- **Solution**: Ensure all patient records include phone numbers during registration

**Issue**: "Twilio credentials not configured"
- **Cause**: Missing `TWILIO_ACCOUNT_SID` or `TWILIO_AUTH_TOKEN`
- **Solution**: Add credentials to `.env` file or remove for dev mode

**Issue**: SMS sending fails in production
- **Cause**: Invalid Twilio credentials or account out of credits
- **Solution**: Verify credentials in Twilio Console, check account balance

---

## 🚀 Future Enhancements (Month 5)

1. **Scheduled Reminders**
   - Use Node.js cron to send reminders 24 hours before appointment
   - Auto-send SMS to patients with upcoming appointments

2. **Queue Notifications**
   - SMS when patient is called for consultation
   - Real-time queue position updates via SMS

3. **Two-Way Messaging**
   - Allow patients to reply to SMS
   - SMS commands: `CANCEL`, `RESCHEDULE`, etc.

4. **Delivery Tracking**
   - Track SMS delivery status
   - Retry failed deliveries

5. **Opt-out Management**
   - Store STOP requests from patients
   - Respect opt-out preferences

---

## 📞 Twilio Support

- **Documentation**: https://www.twilio.com/docs/sms
- **Console**: https://www.twilio.com/console
- **Account Status**: https://www.twilio.com/console/billing/overview

---

## 🔒 Security Notes

- Remove Twilio credentials from version control
- Use `.env` file (added to `.gitignore`)
- Rotate tokens periodically in production
- Validate phone numbers before sending
- Rate limit SMS to prevent abuse

---

**Status**: SMS notification system is now integrated and ready for testing!
