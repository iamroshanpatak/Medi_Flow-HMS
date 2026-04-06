# AI Recommendations Usage Guide - Local Server

This guide shows how to use AI Recommendations in MediFlow on your local development server.

## 🚀 Quick Start

### 1. Prerequisites
- Backend server running on `http://localhost:5000`
- User authenticated with valid token
- User profile updated with health data (weight, height, conditions, etc.)

### 2. Start Your Local Servers

```bash
# Terminal 1: Backend
cd /Users/apple/Desktop/Medi_Flow/backend
npm install
npm start  # Runs on port 5000

# Terminal 2: Frontend
cd /Users/apple/Desktop/Medi_Flow/frontend
npm install
npm run dev  # Runs on port 3000
```

## 📋 Available AI Recommendation APIs

All endpoints require authentication (Bearer token in headers).

### 1. **Generate Personalized Recommendations**
Generate AI-powered health recommendations based on user profile.

```javascript
// Frontend Usage
import { recommendationsAPI } from '@/services/api';

// Generate recommendations
const response = await recommendationsAPI.generateRecommendations();
// With history analysis
const response = await recommendationsAPI.generateRecommendations({ includeHistory: true });

// Response includes:
{
  "success": true,
  "recommendations": [
    {
      "recommendation": "Increase physical activity",
      "priority": "high",
      "reason": "Low exercise frequency detected"
    }
  ],
  "healthScore": 65,
  "riskFactors": ["Sedentary lifestyle", "Potential weight management needed"],
  "priority": "medium",
  "historyInsights": { /* ... */ },
  "predictiveInsights": { /* ... */ },
  "generatedAt": "2024-04-05T...",
  "nextReviewDate": "2024-05-05T..."
}
```

### 2. **Get Health Score**
Get user's current health score (0-100).

```javascript
const healthScore = await recommendationsAPI.getHealthScore();

// Response
{
  "success": true,
  "score": 72,
  "scoreBreakdown": {
    "fitness": 60,
    "nutrition": 80,
    "mentalHealth": 70,
    "preventiveCare": 65
  },
  "status": "Good",
  "lastUpdated": "2024-04-05T..."
}
```

### 3. **Get Personalized Action Plan**
Get a step-by-step action plan for health goals.

```javascript
const actionPlan = await recommendationsAPI.getActionPlan();

// Response
{
  "success": true,
  "goals": [
    {
      "goal": "Reduce weight by 5kg",
      "timeline": "3 months",
      "steps": ["...", "..."],
      "priority": "high"
    }
  ],
  "milestones": [...]
}
```

### 4. **Get Risk Assessment**
Comprehensive risk assessment including cardiovascular, diabetes, etc.

```javascript
const riskAssessment = await recommendationsAPI.getRiskAssessment();

// Response includes cardiovascular risk, diabetes risk, etc.
```

### 5. **Get Screening Recommendations**
Age and health status-based screening recommendations.

```javascript
const screenings = await recommendationsAPI.getScreeningRecommendations();

// Recommends screenings based on age and health profile
```

### 6. **Get Lifestyle Recommendations**
Personalized lifestyle improvement recommendations.

```javascript
const lifestyle = await recommendationsAPI.getLifestyleRecommendations();

// Includes diet, exercise, sleep, stress management recommendations
```

### 7. **Get Health Insights**
AI analysis of patient history and patterns.

```javascript
const insights = await recommendationsAPI.getHealthInsights();

// Advanced insights from patient history
```

## 🩺 AI Triage & Assistance APIs

### 1. **Symptom-to-Department Triage**
Get automatic department recommendation based on symptoms.

```javascript
import { aiAPI } from '@/services/api';

const symptoms = ['fever', 'cough', 'sore throat'];
const triageResult = await aiAPI.triage(symptoms);

// Response
{
  "success": true,
  "symptoms": ["fever", "cough", "sore throat"],
  "result": {
    "department": "General Medicine",
    "label": "Upper Respiratory Infection",
    "confidence": "high",
    "message": "Both algorithms recommend: Upper Respiratory Infection",
    "matchedSymptoms": ["fever", "cough", "sore throat"]
  }
}
```

### 2. **Wait Time Prediction**
Predict patient wait time based on queue and department.

```javascript
const waitTime = await aiAPI.predictWaitTime(
  'General Medicine',  // department
  5,                   // queue position
  2                    // active consultations
);

// Response
{
  "success": true,
  "result": {
    "estimatedWaitTime": "45 minutes",
    "prediction": { /* ... */ }
  }
}
```

### 3. **FAQ Chatbot**
Ask health-related questions and get AI responses.

```javascript
const faqResponse = await aiAPI.askFAQ('How do I manage diabetes?');

// Response
{
  "success": true,
  "message": "How do I manage diabetes?",
  "result": { /* ... */ }
}
```

## 💡 Integration Examples

### Example 1: Show Health Score in Appointments Page

```typescript
// In your appointments page component
import { useState, useEffect } from 'react';
import { recommendationsAPI } from '@/services/api';

export default function AppointmentsPage() {
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHealthScore = async () => {
      try {
        const response = await recommendationsAPI.getHealthScore();
        setHealthScore(response.data.score);
      } catch (error) {
        console.error('Error loading health score:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHealthScore();
  }, []);

  return (
    <div>
      {!loading && healthScore && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="text-sm text-gray-600">Your Health Score</p>
          <p className="text-3xl font-bold text-blue-600">{healthScore}/100</p>
        </div>
      )}
      {/* Rest of appointments content */}
    </div>
  );
}
```

### Example 2: Display AI Recommendations

```typescript
import { recommendationsAPI } from '@/services/api';
import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

export default function RecommendationsPanel() {
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const response = await recommendationsAPI.generateRecommendations({
          includeHistory: true
        });
        setRecommendations(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  if (loading) return <div>Loading recommendations...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-4">
      {/* Health Score */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Health Score</p>
            <p className="text-2xl font-bold text-blue-600">
              {recommendations?.healthScore || 0}
            </p>
          </div>
          <TrendingUp className="text-blue-600" size={32} />
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">AI Recommendations</h3>
        {recommendations?.recommendations?.map((rec: any, idx: number) => (
          <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
            {rec.priority === 'high' ? (
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            ) : (
              <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
            )}
            <div className="flex-1">
              <p className="font-medium">{rec.recommendation}</p>
              <p className="text-sm text-gray-600">{rec.reason}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Risk Factors */}
      {recommendations?.riskFactors?.length > 0 && (
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="font-semibold text-red-900 mb-2">Risk Factors</h4>
          <ul className="space-y-1">
            {recommendations.riskFactors.map((risk: string, idx: number) => (
              <li key={idx} className="text-sm text-red-700">• {risk}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Review */}
      <p className="text-xs text-gray-500">
        Next review: {new Date(recommendations?.nextReviewDate).toLocaleDateString()}
      </p>
    </div>
  );
}
```

### Example 3: Symptom-based Triage in Appointments

```typescript
import { aiAPI } from '@/services/api';

export default function SymptomTriage() {
  const [symptoms, setSymptoms] = useState<string>('');
  const [triageResult, setTriageResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTriage = async () => {
    setLoading(true);
    try {
      const symptomsArray = symptoms
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      if (symptomsArray.length === 0) {
        alert('Please enter at least one symptom');
        return;
      }

      const response = await aiAPI.triage(symptomsArray);
      setTriageResult(response.data.result);
    } catch (error: any) {
      console.error('Triage error:', error);
      alert('Failed to perform triage: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h3 className="font-semibold text-lg">AI Symptom Triage</h3>
      
      <div>
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Enter symptoms (comma-separated): fever, cough, headache"
          className="w-full p-3 border border-gray-300 rounded"
          rows={3}
        />
      </div>

      <button
        onClick={handleTriage}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Analyzing...' : 'Get Triage Recommendation'}
      </button>

      {triageResult && (
        <div className="p-4 bg-blue-50 rounded border border-blue-200">
          <p className="text-sm font-medium text-gray-600">Recommended Department</p>
          <p className="text-xl font-bold text-blue-600 mb-2">
            {triageResult.department}
          </p>
          <p className="text-sm text-gray-700 mb-2">
            <strong>Condition:</strong> {triageResult.label}
          </p>
          <p className="text-sm text-gray-700 mb-2">
            <strong>Confidence:</strong> {triageResult.confidence}
          </p>
          <p className="text-sm text-gray-600">{triageResult.message}</p>
        </div>
      )}
    </div>
  );
}
```

## 📊 Data Requirements for Best Recommendations

For accurate AI recommendations, your user profile should include:

```javascript
{
  age: number,
  gender: string,
  weight: number,  // in kg
  height: number,  // in cm
  conditions: string[],  // e.g., ['diabetes', 'hypertension']
  medications: string[],
  exerciseFrequency: number,  // times per week
  dietQuality: string,  // 'poor', 'fair', 'good', 'excellent'
  sleepHours: number,
  stressLevel: string,  // 'low', 'moderate', 'high'
  smokingStatus: string,
  alcoholConsumption: string,
  labResults: any[],
  familyHistory: string[]
}
```

## 🔧 Environment Configuration

Make sure your `.env.local` file in frontend is configured:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 🐛 Troubleshooting

### Issue: "Network Error: Cannot connect to backend"
- Ensure backend is running on port 5000
- Check NEXT_PUBLIC_API_URL in .env.local
- Try: `curl http://localhost:5000/api/status/health`

### Issue: "401 Unauthorized"
- Token not being saved in localStorage
- User session expired
- Re-login required

### Issue: "Recommendations not detailed"
- Update user profile with complete health information
- Check if medical records are saved in database
- Run: `npm run seed` in backend to populate sample data

## 📚 API Response Examples

See `docs/API_DOCUMENTATION.md` for complete API specifications and example responses.

## ✅ Testing the APIs

Use the included Postman collection or test files:

```bash
# Backend test file
cd backend
npm test

# Or manually test with curl:
curl -X POST http://localhost:5000/api/ai/triage \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"symptoms": ["fever", "cough"]}'
```

---

**Last Updated:** April 5, 2026
**Version:** 1.0.0
