# 🛠️ Month 5 Remaining Development Tasks - Technical Breakdown

## Task 1: Email/SMS Scheduled Reminders (40-50 hours)

### Overview
Send automated reminders 24 hours and 1 hour before appointments via SMS and Email.

### Architecture
```
Cron Job (every 5 minutes)
    ↓
Check appointments in next 24-26 hours → Send Email + SMS reminder
Check appointments in next 1-2 hours   → Send Email + SMS reminder
    ↓
Update `reminder_sent` field in appointment
```

### Files to Create/Modify

#### 1. `/backend/utils/cronService.js` (NEW)
```javascript
Purpose: Handle all scheduled jobs
Functions needed:
  - initCronJobs() - Start all scheduled jobs
  - scheduleAppointmentReminders() - Main reminder scheduler
  - checkRemindersAndSend() - Check appointments and send notifications
  - stopCronJobs() - Clean shutdown
```

#### 2. `/backend/utils/reminderService.js` (NEW)
```javascript
Purpose: Send reminders to patients
Functions needed:
  - sendAppointmentReminder(appointmentId, type) 
    - type: '24hour' or '1hour'
  - notifyPatient(patient, appointment, reminderType)
  - formatReminderMessage(appointment, reminderType)
```

#### 3. `/backend/models/Appointment.js` (MODIFY)
```javascript
Add fields:
  - reminder_24h_sent: { type: Boolean, default: false }
  - reminder_1h_sent: { type: Boolean, default: false }
  - reminder_24h_sent_at: Date
  - reminder_1h_sent_at: Date
```

#### 4. `/backend/server.js` (MODIFY)
```javascript
Add at startup (line ~30):
  const cronService = require('./utils/cronService');
  cronService.initCronJobs();

Add at shutdown:
  cronService.stopCronJobs();
```

### Implementation Steps
1. Install `node-cron`: `npm install node-cron`
2. Create cronService.js with reminder logic
3. Update Appointment model with reminder flags
4. Integrate cron startup in server.js
5. Test with test appointments
6. Verify logs show reminders being sent

### Testing Checklist
- [ ] Cron job initializes without errors
- [ ] Query finds appointments within 24-26 hours
- [ ] SMS sent for 24-hour reminder
- [ ] Email sent for 24-hour reminder
- [ ] Flags updated in database
- [ ] No duplicate reminders sent
- [ ] 1-hour reminders work correctly

---

## Task 2: AI Chatbot & FAQ System (80-100 hours)

### Overview
Basic NLP-powered chatbot for common patient queries about appointments, hours, services.

### Architecture
```
User Message
    ↓
[Chatbot Service]
    ├─ Extract intent (what is user asking?)
    ├─ Match with FAQ database
    └─ Generate response
    ↓
Return answer to user
```

### Files to Create/Modify

#### 1. `/backend/utils/chatbotService.js` (NEW - 300+ lines)
```javascript
Purpose: NLP intent matching and response generation
Functions needed:
  - analyzeSentiment(text) - How does user feel?
  - extractIntent(text) - What does user want?
  - findMatchingFAQ(intent) - Find best answer
  - generateResponse(intent, faqData) - Format response
  - trainModel() - Initialize NLP
  - handleFallback(text) - Handle unknown queries
  
Intents to support:
  - BOOK_APPOINTMENT
  - RESCHEDULE_APPOINTMENT
  - CANCEL_APPOINTMENT
  - CHECK_HOURS
  - FIND_DOCTOR
  - HEALTH_QUESTION
  - GENERAL_INFO
  - APPOINTMENT_STATUS
  - PAYMENT_QUERY
  - OTHER
```

#### 2. `/backend/routes/chatbot.js` (NEW - 100+ lines)
```javascript
Routes needed:
  POST /api/chatbot
    - body: { message: string, userId: string }
    - response: { reply: string, intent: string, confidence: number }
  
  GET /api/chatbot/faqs
    - Get all FAQ items
  
  POST /api/chatbot/feedback
    - Log user satisfaction
    - body: { messageId: string, helpful: boolean }
```

#### 3. `/frontend/components/ChatBot.tsx` (NEW - 250+ lines)
```typescript
Purpose: Chat widget UI component
Features:
  - Messages display
  - Input field with send button
  - Typing indicator
  - Auto-scroll to latest message
  - Responsive design
  - Mobile-friendly
  
Hooks:
  - useState for messages[]
  - useEffect for auto-scroll
  - useCallback for send message
```

#### 4. `/frontend/app/chatbot/page.tsx` (NEW)
```typescript
Purpose: Full-page chatbot interface
Features:
  - Full-screen chat
  - Suggested quick replies
  - Chat history
  - Clear history button
```

#### 5. `/backend/models/ChatMessage.js` (NEW - Document schema)
```javascript
Fields:
  - userId: ObjectId (reference to User)
  - message: String
  - response: String
  - intent: String
  - confidence: Number (0-1)
  - helpful: Boolean
  - createdAt: Date
  - updatedAt: Date
```

#### 6. `/backend/models/FAQ.js` (NEW - Knowledge base)
```javascript
Fields:
  - question: String
  - answer: String
  - category: String (appointments, hours, doctors, etc)
  - keywords: [String] - for matching
  - intent: String
  - priority: Number
  - active: Boolean
  - createdAt: Date
```

### NLP Library Setup
**Option 1: Compromise.js (Lightweight, 40KB)**
```javascript
const nlp = require('compromise');
const text = nlp('Book an appointment with Dr. Smith');
text.verbs().out('normal'); // "book"
```

**Option 2: Natural.js (Heavier, more powerful)**
```javascript
const natural = require('natural');
const classifier = new natural.BayesClassifier();
classifier.addDocument('book appointment', 'BOOK_APPOINTMENT');
```

**Recommendation:** Start with Compromise for speed, migrate to NLP if needed

### FAQ Database
Need to populate with ~20-30 common questions:
```javascript
// Examples:
[
  {
    category: 'Booking',
    question: 'How do I book an appointment?',
    answer: 'You can book...',
    keywords: ['book', 'appointment', 'schedule'],
    intent: 'BOOK_APPOINTMENT',
  },
  {
    category: 'Hours',
    question: 'What are your working hours?',
    answer: 'We are open 9 AM to 6 PM...',
    keywords: ['hours', 'timing', 'open', 'close'],
    intent: 'CHECK_HOURS',
  },
  // ... more FAQs
]
```

### Implementation Steps
1. Install NLP library: `npm install compromise` (or `natural`)
2. Create chatbotService.js with intent matching
3. Create FAQ model and seed initial data
4. Create chatbot API routes
5. Create frontend Chat component
6. Integrate chat widget into sidebar
7. Test various user queries
8. Log conversations for improvement

### Testing Checklist
- [ ] Intent recognition works (70%+ accuracy)
- [ ] FAQ matching returns relevant answers
- [ ] API endpoint returns responses within 500ms
- [ ] Chat widget displays messages correctly
- [ ] Messages persist in database
- [ ] Suggested replies work
- [ ] Mobile responsive

---

## Task 3: Health Recommendations Engine (40-60 hours)

### Overview
Basic rule-based recommendations based on patient history.

### Files to Create/Modify

#### 1. `/backend/utils/recommendationService.js` (NEW)
```javascript
Functions:
  - generateRecommendations(patientId) - Main function
  - analyzeAppointmentHistory(appointments)
  - suggestCheckups(medicalHistory, age)
  - recommendPrevention(riskFactors)
  - formatRecommendations(suggestions)

Rules engine:
  - Age > 40 → Suggest annual checkup
  - 3+ appointments in month → Suggest health assessment
  - Chronic condition → Regular monitoring
  - No appointment in 6 months → Suggest checkup
```

#### 2. `/backend/routes/health.js` (NEW)
```javascript
Routes:
  GET /api/health/recommendations/:patientId
  GET /api/health/insights/:patientId
  POST /api/health/feedback (patient feedback on recommendations)
```

#### 3. `/frontend/components/HealthInsights.tsx` (NEW)
```typescript
Features:
  - Display recommendations
  - Health score card
  - Suggested appointments
  - Health tips
  - Book appointment buttons
```

#### 4. `/frontend/app/health/page.tsx` (NEW)
```typescript
Purpose: Health insights page
Show:
  - Personalized recommendations
  - Health history
  - Upcoming checkups
  - Health tips
```

### Implementation Steps
1. Create recommendationService.js with rules
2. Create health API routes
3. Add HealthInsights component
4. Integrate into patient dashboard
5. Test with sample patient data
6. Add backend logging for recommendations

---

## Task 4: Queue Analytics & Performance Metrics (40-60 hours)

### Overview
Generate insights about queue efficiency, doctor performance, appointment trends.

### Files to Create/Modify

#### 1. `/backend/utils/analyticsService.js` (NEW)
```javascript
Functions:
  - getQueueMetrics(doctorId, dateRange)
  - calculateAverageWaitTime(appointments)
  - getPeakHours(appointments)
  - getDoctorPerformance(doctorId)
  - getAppointmentTrends(dateRange)
  - getNoShowRate(appointments)
  - calcWaitTimeDistribution(appointments)
```

#### 2. `/backend/routes/analytics.js` (NEW)
```javascript
Routes (Admin only):
  GET /api/analytics/queue - Overall metrics
  GET /api/analytics/doctor/:doctorId - Doctor performance
  GET /api/analytics/appointments - Booking trends
  GET /api/analytics/waittime - Wait time analysis
  GET /api/analytics/health - Health trends
```

#### 3. `/frontend/app/admin/analytics/page.tsx` (NEW)
```typescript
Components:
  - WaitTimeChart (line graph)
  - PeakHoursChart (bar graph)
  - DoctorPerformanceCard (card grid)
  - NoShowRateCard
  - AppointmentTrendsChart
  - DateRangePicker (filter)

Charts using:
  - recharts for visualizations
  - date-fns for date handling
```

### Metrics to Track
1. **Queue Metrics**
   - Average wait time per doctor
   - Max wait time
   - Min wait time
   - Total patients seen

2. **Doctor Performance**
   - Appointments completed
   - Average consultation time
   - Patient satisfaction (if applicable)
   - No-show rate

3. **Appointment Trends**
   - Booking trends (up/down)
   - Cancellation rate
   - No-show rate
   - Busiest days/times

---

## 🎯 Recommended Priority Order

### Week 1 (30-40 hours)
1. **Email/SMS Scheduled Reminders** ← START HERE (High value, medium effort)
   - Reduces no-shows
   - Uses existing SMS/Email services
   - Simple to implement

### Week 2 (40-50 hours)
2. **AI Chatbot with FAQs** ← NEXT (High impact on UX)
   - Improves patient experience
   - Handles common queries
   - Lightweight NLP

### Week 3 (20-30 hours)
3. **Health Recommendations** ← OPTIONAL (Nice to have)
   - Personalized suggestions
   - Improves patient engagement

### Week 4 (20-30 hours)
4. **Queue Analytics** ← OPTIONAL (Admin feature)
   - Performance insights
   - Can move to Month 6

---

## 💾 Database Changes Summary

### New Collections/Models Needed
```
Appointment (MODIFY)
  + reminder_24h_sent: Boolean
  + reminder_1h_sent: Boolean
  + reminder_24h_sent_at: Date
  + reminder_1h_sent_at: Date

FAQ (NEW)
  - question, answer, category, keywords
  - intent, priority, active

ChatMessage (NEW)
  - userId, message, response, intent
  - confidence, helpful, createdAt

HealthRecommendation (NEW)
  - patientId, recommendations[], createdAt

Analytics (NEW) - Optional
  - metrics, doctorId, date, queueData
```

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] cronService reminder logic
- [ ] chatbot intent matching
- [ ] recommendation rules
- [ ] analytics calculations

### Integration Tests
- [ ] SMS + Email reminders sent together
- [ ] Chatbot API returns correct format
- [ ] Health recommendations sync with patient data
- [ ] Analytics queries return accurate data

### E2E Tests
- [ ] Book appointment → Get reminder 24hrs later
- [ ] Chat with bot → Get FAQ answer
- [ ] View health dashboard → See recommendations
- [ ] View analytics → See queue metrics

---

## 📦 Dependencies to Install

```bash
# Reminders
npm install node-cron

# NLP/Chatbot  
npm install compromise
# OR
npm install natural

# Analytics/Charts (frontend)
npm install recharts date-fns
```

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
cd /Users/apple/Desktop/Medi_Flow/backend
npm install node-cron compromise

# For frontend
cd /Users/apple/Desktop/Medi_Flow/frontend
npm install recharts date-fns

# Test reminders scheduler
node -e "const cron = require('node-cron'); cron.schedule('*/5 * * * *', () => console.log('Cron running'));"
```

---

## 📋 Completion Checklist

- [ ] Reminders scheduler running
- [ ] SMS reminders sent successfully
- [ ] Email reminders sent successfully
- [ ] Chatbot API endpoint working
- [ ] Chat widget displaying properly
- [ ] FAQ database populated
- [ ] Health recommendations generating
- [ ] Analytics queries returning data
- [ ] All tests passing
- [ ] Month 5 documentation complete

---

**Last Updated:** March 30, 2026  
**Status:** Ready for implementation  
**Assigned to:** Development Team
