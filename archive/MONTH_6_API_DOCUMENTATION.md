# 🧠 MediFlow Month 6 API Documentation
## Advanced NLP & Health Recommendations Endpoints

**Base URL:** `http://localhost:5000/api`

**Authentication:** All endpoints require JWT token in Authorization header: `Bearer <token>`

---

## 📊 NLP Endpoints (6 Total)

### 1. Analyze Medical Text
- **Method:** POST
- **Endpoint:** `/nlp/analyze`
- **Purpose:** Extract medical entities from patient input and generate responses

**Request:**
```json
{
  "text": "I have severe chest pain and shortness of breath",
  "conversationHistory": []
}
```

**Response:**
```json
{
  "entities": {
    "symptoms": ["chest pain", "shortness of breath"],
    "conditions": [],
    "medications": [],
    "severity": "high",
    "intent": "symptom_inquiry",
    "confidence": 0.92
  },
  "context": {
    "emotionalTone": "concerned",
    "urgency": "high",
    "clarity": "clear",
    "followUp": false
  },
  "response": {
    "message": "Your symptoms require immediate medical attention...",
    "level": "emergency",
    "action": "call_emergency"
  },
  "departmentRecommendations": ["Cardiology", "Emergency Medicine"],
  "nextSteps": ["Call 911", "Go to nearest ER"],
  "confidenceScore": 0.92,
  "timestamp": "2026-03-30T10:30:00Z"
}
```

---

### 2. Detect Urgency Level
- **Method:** POST
- **Endpoint:** `/nlp/detect-urgency`
- **Purpose:** Assess urgency of symptoms (critical, high, moderate, low)

**Request:**
```json
{
  "symptomDescription": "Sudden chest pain and difficulty breathing"
}
```

**Response:**
```json
{
  "urgencyLevel": "critical",
  "emotionalTone": "distressed",
  "recommendation": "Seek immediate emergency care",
  "shouldNotifyDoctor": true,
  "confidence": 0.95
}
```

---

### 3. Get Conversation Insights
- **Method:** GET
- **Endpoint:** `/nlp/insights`
- **Query Params:** `days` (default: 30)
- **Purpose:** Aggregate insights from conversation history

**Response:**
```json
{
  "aggregatedSymptoms": ["cough", "fever", "headache"],
  "commonIntents": ["symptom_inquiry", "medication_question"],
  "averageConfidence": 0.87,
  "patterns": ["recurring_cough", "seasonal_variation"],
  "frequentDepartments": ["ENT", "Pulmonology"],
  "actionItems": ["Schedule follow-up appointment"]
}
```

---

### 4. Suggest Appointments
- **Method:** POST
- **Endpoint:** `/nlp/suggest-appointments`
- **Purpose:** Recommend appropriate departments/doctors

**Request:**
```json
{
  "symptoms": ["chest pain", "shortness of breath"]
}
```

**Response:**
```json
{
  "suggestedDepartments": ["Cardiology", "Pulmonology"],
  "urgencyLevel": "high",
  "estimatedWaitTime": 15,
  "recommendedDoctors": ["Dr. Smith (Cardiology)"],
  "appointmentTypes": ["Emergency", "Urgent Care"]
}
```

---

### 5. Interactive Medical Chat
- **Method:** POST
- **Endpoint:** `/nlp/chat`
- **Purpose:** Stateful medical chatbot interaction

**Request:**
```json
{
  "message": "How can I manage my diabetes better?",
  "conversationId": "conv-12345",
  "conversationHistory": []
}
```

**Response:**
```json
{
  "response": "Based on your question, diabetes management...",
  "level": "medical",
  "action": "consult_doctor",
  "suggestions": ["Consult endocrinologist", "Review diet plan"],
  "departments": ["Endocrinology", "Nutrition"],
  "confidence": 0.88,
  "timestamp": "2026-03-30T10:35:00Z"
}
```

---

### 6. FAQ Response
- **Method:** POST
- **Endpoint:** `/nlp/faq`
- **Purpose:** Match questions to FAQ and return responses

**Request:**
```json
{
  "question": "What are the symptoms of diabetes?"
}
```

**Response:**
```json
{
  "response": "Common symptoms of diabetes include...",
  "confidence": 0.91,
  "relatedQuestions": [
    "How is diabetes treated?",
    "Can diabetes be prevented?"
  ],
  "category": "chronic_conditions"
}
```

---

## 💪 Recommendations Endpoints (8 Total)

### 1. Generate Recommendations
- **Method:** GET
- **Endpoint:** `/recommendations/generate`
- **Purpose:** Generate personalized health recommendations

**Response:**
```json
{
  "recommendations": {
    "immediate": ["Rest", "Take prescribed medication"],
    "shortTerm": ["Schedule cardiology appointment"],
    "longTerm": ["Start regular exercise program"],
    "lifestyle": ["Reduce sodium intake"],
    "monitoring": ["Track blood pressure daily"]
  },
  "healthScore": 68,
  "riskFactors": ["high_blood_pressure"],
  "priority": "high"
}
```

---

### 2. Get Health Score
- **Method:** GET
- **Endpoint:** `/recommendations/health-score`
- **Purpose:** Calculate and return health score (0-100)

**Response:**
```json
{
  "healthMetrics": {
    "healthScore": 72,
    "bmi": 24.5,
    "age": 45,
    "riskLevel": "moderate",
    "trend": "improving",
    "scoreChange": 5,
    "components": {
      "lifestyle": 70,
      "medical": 75,
      "preventive": 68
    }
  }
}
```

---

### 3. Get Action Plan
- **Method:** GET
- **Endpoint:** `/recommendations/action-plan`
- **Query Params:** `duration` (default: "3 months")
- **Purpose:** Generate SMART goals and milestones

**Response:**
```json
{
  "goals": [
    {
      "id": "goal-1",
      "title": "Start regular exercise",
      "description": "Exercise 30 minutes daily",
      "startDate": "2026-03-30",
      "targetDate": "2026-06-30",
      "completed": false
    }
  ],
  "milestones": [
    {
      "date": "2026-04-15",
      "title": "Week 1-2: Establish routine",
      "accomplished": false
    }
  ],
  "resources": ["Fitness app", "Nutritionist consultation"],
  "tracking": {
    "completedGoals": 0,
    "totalGoals": 5,
    "progressPercentage": 0
  }
}
```

---

### 4. Get Risk Assessment
- **Method:** GET
- **Endpoint:** `/recommendations/risk-assessment`
- **Purpose:** Comprehensive multi-category risk evaluation

**Response:**
```json
{
  "overallRiskScore": 45,
  "cardiovascular": {
    "score": 55,
    "category": "moderate",
    "factors": ["elevated_BP", "family_history"]
  },
  "metabolic": {
    "score": 40,
    "category": "low",
    "factors": []
  },
  "mentalHealth": {
    "score": 35,
    "category": "low",
    "factors": []
  },
  "alerts": [
    {
      "severity": "high",
      "message": "Blood pressure elevated"
    }
  ],
  "priorities": ["BP management", "Weight reduction"]
}
```

---

### 5. Get Screening Recommendations
- **Method:** GET
- **Endpoint:** `/recommendations/screenings`
- **Purpose:** Age-appropriate preventive screening recommendations

**Response:**
```json
{
  "screenings": [
    {
      "name": "Blood Pressure",
      "frequency": "Annual",
      "lastCompleted": "2025-12-15",
      "dueDate": "2026-12-15",
      "priority": "high"
    },
    {
      "name": "Cholesterol Panel",
      "frequency": "Every 5 years",
      "lastCompleted": "2021-03-20",
      "dueDate": "2026-03-20",
      "priority": "critical"
    }
  ]
}
```

---

### 6. Get Lifestyle Recommendations
- **Method:** GET
- **Endpoint:** `/recommendations/lifestyle`
- **Purpose:** Personalized lifestyle modification guidance

**Response:**
```json
{
  "lifestyle": {
    "exercise": {
      "current": "sedentary",
      "recommendation": "Moderate exercise 30 min/day",
      "benefits": ["Improved cardiovascular health"]
    },
    "diet": {
      "current": "high_sodium",
      "recommendation": "Mediterranean diet",
      "benefits": ["Reduced blood pressure"]
    },
    "sleep": {
      "current": "7 hours",
      "recommendation": "Maintain 7-8 hours"
    },
    "stress": {
      "current": "moderate",
      "recommendation": "Meditation and relaxation"
    }
  },
  "suggestedApps": ["Fitbit", "MyFitnessPal", "Calm"]
}
```

---

### 7. Get Health Insights
- **Method:** GET
- **Endpoint:** `/recommendations/insights`
- **Purpose:** AI-generated comprehensive health insights

**Response:**
```json
{
  "profile": {
    "age": 45,
    "chronic_conditions": ["hypertension"],
    "medications": 2,
    "recent_visits": 3
  },
  "keyFindings": [
    "Blood pressure elevated and trending up",
    "Weight stable but above healthy range"
  ],
  "trends": [
    {
      "metric": "blood_pressure",
      "trend": "increasing",
      "confidence": 0.85
    }
  ],
  "predictions": ["Risk of cardiac event in next 2 years: 12%"],
  "recommendations": ["Schedule cardiology consultation"],
  "nextActions": ["Take BP medication as prescribed"]
}
```

---

### 8. Update Health Metrics
- **Method:** PUT
- **Endpoint:** `/recommendations/update-metrics`
- **Purpose:** Update patient health metrics and regenerate recommendations

**Request:**
```json
{
  "weight": 75,
  "bloodPressure": {
    "systolic": 130,
    "diastolic": 85
  },
  "bloodGlucose": 110,
  "exerciseMinutes": 30
}
```

**Response:**
```json
{
  "success": true,
  "message": "Health metrics updated successfully",
  "newHealthScore": 73,
  "newRecommendations": {
    "immediate": ["Continue current treatment"],
    "shortTerm": ["Schedule follow-up in 2 weeks"]
  }
}
```

---

## 🧪 Testing with cURL

**Test NLP Analyze:**
```bash
curl -X POST http://localhost:5000/api/nlp/analyze \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I have chest pain",
    "conversationHistory": []
  }'
```

**Test Health Score:**
```bash
curl -X GET http://localhost:5000/api/recommendations/health-score \
  -H "Authorization: Bearer your_token_here"
```

**Test Update Metrics:**
```bash
curl -X PUT http://localhost:5000/api/recommendations/update-metrics \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "weight": 75,
    "bloodPressure": {"systolic": 130, "diastolic": 85},
    "bloodGlucose": 110,
    "exerciseMinutes": 30
  }'
```

---

## 📈 Response Status Codes

- **200 OK** - Successful request
- **201 Created** - Resource created successfully
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Missing or invalid token
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Endpoint not found
- **500 Internal Server Error** - Server error

---

## 🔐 Authentication

All endpoints require a valid JWT token obtained from login endpoint:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Response includes `token` field - use this in all subsequent requests.

---

## 📌 Notes

- All timestamps are in ISO 8601 format (UTC)
- Health scores range from 0-100 (higher is better)
- Risk scores range from 0-100 (lower is better)
- All monetary values are in local currency (USD recommended)
- Bulk operations are not supported; use individual requests
- Rate limiting may be implemented in production

---

**Generated:** March 30, 2026  
**Month 6 Implementation:** Advanced NLP & Health Recommendations System
