# Integrated AI Health System - Implementation Guide

╔══════════════════════════════════════════════════════════════════════╗
║          INTEGRATED AI HEALTH SYSTEM - IMPLEMENTATION GUIDE           ║
║        Auto Doctor Booking + Health Graph + Action Plan               ║
╚══════════════════════════════════════════════════════════════════════╝

✅ FEATURE OVERVIEW

This integrated system replaces the "Triage" tab with "AI Health" and creates
a seamless workflow:

1️⃣  AI HEALTH ANALYSIS
   └─ Patient enters symptoms
   └─ AI analyzes and determines:
      - Recommended department is analyzed
      - Health severity level determined (critical/high/moderate/low)
      - Matched symptoms documented
      - Confidence level provided

2️⃣  AUTOMATIC DOCTOR BOOKING
   └─ System finds available doctor in recommended department
   └─ Books appointment based on urgency:
      - CRITICAL scheduled at 09:00 (earliest)
      - HIGH scheduled at 10:00
      - MODERATE/LOW scheduled at 10:00+
   └─ Creates appointment with reason based on symptoms
   └─ Shows confirmation with doctor details

3️⃣  HEALTH GRAPH (Renamed from Trends)
   └─ Displays 28-day health projection
   └─ Adjusted based on current symptom severity:
      - CRITICAL: minus 15 points impact
      - HIGH: minus 10 points
      - MODERATE: minus 5 points
      - LOW: No significant impact
   └─ Shows recovery trend line

4️⃣  ACTION PLAN
   └─ Auto-redirects after booking
   └─ Shows doctor appointment details:
      - Doctor name and specialization listed
      - Appointment date and time provided
      - Condition being treated specified
   └─ Displays personalized action steps
   └─ Recovery timeline

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 TAB STRUCTURE

OLD TAB NAMES         →  NEW TAB NAMES
─────────────────────────────────────
✗ Triage             →  ✓ AI Health
✓ Overview           →  ✓ Overview (unchanged)
Trends               →  ✓ Health Graph
Action Plan          →  ✓ Action Plan

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔄 WORKFLOW DIAGRAM

┌─────────────────────────────────────────────────────────┐
│ 1. AI HEALTH TAB                                        │
│    ├─ Symptom Input: "fever, cough, fatigue"          │
│    └─ Button: "Analyze Symptoms"                       │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 2. ANALYSIS RESULT                                      │
│    ├─ Department: General Medicine                      │
│    ├─ Condition: Common Cold (Viral)                    │
│    ├─ Health Level: MODERATE  ⚠️                        │
│    ├─ Confidence: 85%                                   │
│    └─ Button: "Book Doctor Automatically"              │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 3. AUTO BOOKING (Backend Process)                       │
│    ├─ Find doctors in "General Medicine"               │
│    ├─ Get first available doctor                        │
│    ├─ Book appointment for tomorrow at 10:00            │
│    └─ Create appointment with symptoms as reason        │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 4. CONFIRMATION                                         │
│    ├─ ✅ Appointment booked with Dr. John Smith       │
│    ├─ Date: 2026-04-07                                 │
│    ├─ Time: 10:00                                       │
│    └─ Buttons:                                          │
│       ├─ "View Action Plan →" (redirects to tab)       │
│       └─ "Start New Analysis" (reset form)             │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼ (Auto-redirect after 2 seconds)
┌─────────────────────────────────────────────────────────┐
│ 5. ACTION PLAN TAB (Auto-opened)                        │
│    ├─ DOCTOR APPOINTMENT DETAILS                        │
│    │  ├─ Doctor: Dr. John Smith                        │
│    │  ├─ Specialization: General Medicine              │
│    │  ├─ Date & Time: 2026-04-07 at 10:00              │
│    │  └─ Condition: Common Cold (Viral)                │
│    │                                                    │
│    └─ ACTION STEPS                                      │
│       ├─ Goal 1: Rest & Recovery (3 days)              │
│       ├─ Goal 2: Hydration & Nutrition (5 days)        │
│       └─ Goal 3: Follow-up Review (7 days)             │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ 6. HEALTH GRAPH TAB (Optional - can view anytime)       │
│    ├─ 28-Day Projection Graph                          │
│    ├─ Adjusted for: Common Cold (Moderate)             │
│    ├─ Health Impact: -5 points                          │
│    └─ Recovery Trend: 📈 Improving with treatment      │
└─────────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💾 STATE MANAGEMENT

const [symptoms, setSymptoms] = useState('');
   └─ User-entered comma-separated symptoms

const [triageResult, setTriageResult] = useState(null);
   └─ Result from AI analysis with health level

const [appointmentBooked, setAppointmentBooked] = useState(false);
   └─ Boolean to track booking status

const [bookedAppointment, setBookedAppointment] = useState(null);
   └─ Object: { doctorId, doctorName, date, time }

const [symptomTrendData, setSymptomTrendData] = useState(TREND_DATA);
   └─ Modified trend data based on symptom severity

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 KEY FUNCTIONS

1. handleAIHealthAnalysis()
   ├─ Triggered by: "Analyze Symptoms" button
   ├─ Input: symptoms (comma-separated string)
   ├─ Process:
   │  ├─ Parse symptoms array
   │  ├─ Call aiAPI.triage(symptomsArray)
   │  ├─ Determine health level from confidence:
   │  │  ├─ high confidence → CRITICAL
   │  │  ├─ medium → HIGH
   │  │  └─ low → MODERATE
   │  └─ Update symptom trend
   └─ Output: setTriageResult with health level

2. updateSymptomTrend(condition, healthLevel)
   ├─ Impact mapping:
   │  ├─ CRITICAL: -15 points
   │  ├─ HIGH: -10 points
   │  ├─ MODERATE: -5 points
   │  └─ LOW: 0 points
   ├─ Adjusts all metrics:
   │  ├─ Overall score
   │  ├─ Fitness
   │  ├─ Nutrition
   │  └─ Mental health
   └─ Output: setSymptomTrendData

3. handleAutoBookDoctor()
   ├─ Triggered by: "Book Doctor Automatically" button
   ├─ Process:
   │  ├─ Get doctors by triageResult.department
   │  ├─ Select first available doctor
   │  ├─ Calculate appointment date (tomorrow)
   │  ├─ Determine time based on health level:
   │  │  ├─ CRITICAL → 09:00
   │  │  └─ Others → 10:00
   │  ├─ Create appointmentData with:
   │  │  ├─ doctorId
   │  │  ├─ appointmentDate
   │  │  ├─ startTime & endTime
   │  │  ├─ reason (symptom description)
   │  │  └─ priority (high if critical)
   │  ├─ Call appointmentsAPI.create()
   │  ├─ Set appointment booked state
   │  ├─ Show confirmation toast
   │  └─ Auto-redirect to action-plan tab (2s delay)
   └─ Output: setAppointmentBooked(true)

4. handleReset()
   ├─ Triggered by: "Reset" button (after booking)
   ├─ Clears:
   │  ├─ Symptoms input
   │  ├─ Triage result
   │  ├─ Appointment booked state
   │  ├─ Booked appointment details
   │  └─ Symptom trend (resets to baseline)
   └─ Output: Toast notification + cleared state

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎨 HEALTH LEVEL COLOR CODING

CRITICAL  → Red           (#dc2626) - Urgent, book ASAP
HIGH      → Orange        (#f97316) - Important, book soon  
MODERATE  → Yellow        (#eab308) - Standard, book tomorrow
LOW       → Green         (#16a34a) - Advisory, routine checkup

Applied to:
├─ Status badge in analysis result
├─ Border color in result box
├─ Text color for level indicator
└─ Appointment priority

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 HEALTH GRAPH CALCULATIONS

Base data (28-day trend):
  Day 1:  score=60, fitness=50, nutrition=65, mental=65
  Day 7:  score=62, fitness=52, nutrition=68, mental=67
  Day 14: score=65, fitness=55, nutrition=70, mental=70
  Day 21: score=68, fitness=58, nutrition=72, mental=72
  Day 28: score=72, fitness=62, nutrition=75, mental=75

Impact adjustments based on health level:
  
  CRITICAL (-15):
    Day 1:  45, 42.5, 59, 60
    Day 28: 57, 54.5, 67.5, 67.5 (worse prognosis)

  HIGH (-10):
    Day 1:  50, 45, 61.7, 60
    Day 28: 62, 57, 71.7, 70

  MODERATE (-5):
    Day 1:  55, 47.5, 63.3, 62.5
    Day 28: 67, 59.5, 73.3, 72.5

  LOW (0):
    Day 1:  60, 50, 65, 65
    Day 28: 72, 62, 75, 75 (normal trajectory)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 API CALLS MADE

1. recommendationsAPI.getHealthScore()
   └─ Get current health score for overview

2. recommendationsAPI.generateRecommendations()
   └─ Get AI recommendations

3. aiAPI.triage(symptomsArray)
   └─ Analyze symptoms, return analysis result

4. doctorsAPI.getBySpecialization(department)
   └─ Find available doctors by department

5. appointmentsAPI.create(appointmentData)
   └─ Create new appointment

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ USER EXPERIENCE FLOW

Step 1: Patient opens AI Health tab
   └─ Sees input form: "Enter your symptoms (comma-separated)"
   └─ Example: "fever, cough, sore throat, fatigue"

Step 2: Click "Analyze Symptoms"
   └─ Loading spinner shows "Analyzing..."
   └─ Toast: "🏥 AI Health analysis complete - Ready to book doctor"

Step 3: View Analysis Result
   ├─ Condition: Common Cold (Viral)
   ├─ Department: General Medicine
   ├─ Health Level: MODERATE ⚠️ (yellow badge)
   ├─ Confidence: 85%
   └─ Button: "Book Doctor Automatically"

Step 4: Click "Book Doctor"
   └─ Loading: "Booking Doctor..."
   └─ Toast: "✅ Appointment booked with Dr. James Johnson"
   └─ 2-second countdown...
   └─ Auto-redirect to "Action Plan" tab

Step 5: See Appointment Confirmation
   ├─ Doctor: Dr. James Johnson
   ├─ Date: 2026-04-07
   ├─ Time: 10:00
   └─ Buttons:
      ├─ "View Action Plan →" (already visible)
      └─ "Start New Analysis" (reset for new symptoms)

Step 6: Action Plan Shows
   ├─ Doctor Details Card
   ├─ Appointment Confirmation
   └─ Action Steps from recommendations

Step 7: Optional - View Health Graph
   └─ Shows 28-day projection with symptom impact
   └─ Can return anytime

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛠️ REQUIRED CHANGES

Files to Modify:
✓ frontend/components/AIRecommendationsPanel.tsx (or AIRecommendationsPanelEnhanced.tsx)

Functions to Add/Modify:
✓ handleAIHealthAnalysis() - New
✓ handleAutoBookDoctor() - New
✓ updateSymptomTrend() - New
✓ handleReset() - New
✓ Add bookingDoctor, appointmentBooked, bookedAppointment states

State Variables to Add:
✓ const [bookingDoctor, setBookingDoctor] = useState(false);
✓ const [appointmentBooked, setAppointmentBooked] = useState(false);
✓ const [bookedAppointment, setBookedAppointment] = useState(null);
✓ const [symptomTrendData, setSymptomTrendData] = useState(HEALTH_TREND_DATA);

UI Changes:
✓ Rename "Triage" tab to "AI Health"
✓ Rename "Trends" tab to "Health Graph"
✓ Update tab navigation labels
✓ Create health level color utility functions
✓ Add appointment confirmation card

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧪 TESTING SCENARIOS

Test Case 1: Critical Health Condition
├─ Input: "severe chest pain, difficulty breathing, dizziness"
├─ Expected: CRITICAL level (red), 09:00 appointment time

Test Case 2: Moderate Symptoms
├─ Input: "slight fever, mild cough, slight fatigue"
├─ Expected: MODERATE level (yellow), 10:00 appointment

Test Case 3: Auto-redirect
├─ After booking, should auto-switch to Action Plan in 2 seconds
├─ Manual click on Action Plan should also work

Test Case 4: Reset Functionality
├─ After booking, click "Start New Analysis"
├─ Symptoms, triageResult, and appointment should clear
├─ Form should be ready for new input

Test Case 5: Health Graph Update
├─ Critical condition should show -15 points impact
├─ Moderate should show -5 points
├─ Graph should be different from baseline

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 NOTES FOR IMPLEMENTATION

1. Auto-redirect delay: 2000ms (2 seconds) to show confirmation
2. Default appointment date: Tomorrow
3. Doctor selection: First available from matching specialization
4. Error handling: Show toast if no doctors available
5. Reason field includes: "AI Health Analysis: [condition] - [symptoms]"
6. Priority: Set to "high" if health level is critical
7. Health graph uses recharts LineChart component
8. Toast notifications for user feedback
9. Disabled button states during loading
10. Reset clears all state to initial values

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ BENEFITS

For Patients:
✓ One-click AI health analysis
✓ Instant doctor appointment booking
✓ No manual searching for doctors
✓ Urgent cases prioritized (CRITICAL at 09:00)
✓ Visual health impact assessment
✓ Clear action plan with doctor assignments

For Doctors:
✓ Accurate symptom-based triage
✓ Patient history in appointment reason
✓ Automatic scheduling of urgent cases
✓ Clear health severity information

For Hospital:
✓ Better resource allocation
✓ Reduced appointment booking time
✓ Automated urgent case prioritization
✓ Complete patient health journey tracking

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generated: April 6, 2026
Status: Implementation Guide Ready

All features are interconnected and provide a seamless patient experience
from symptom input → AI analysis → Doctor booking → Action plan.

╔══════════════════════════════════════════════════════════════════════╗
║          READY TO IMPLEMENT - ALL SPECS DOCUMENTED                  ║
╚══════════════════════════════════════════════════════════════════════╝
