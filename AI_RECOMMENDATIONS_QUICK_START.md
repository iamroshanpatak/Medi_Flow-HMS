# AI Recommendations - Quick Reference

## ⚡ 30-Second Setup

### 1. Backend is Ready ✓
AI recommendation endpoints are already available:
- `GET /api/recommendations/generate` - Get recommendations
- `GET /api/recommendations/health-score` - Get health score
- `POST /api/ai/triage` - Analyze symptoms
- `POST /api/ai/waittime` - Predict wait time
- `POST /api/ai/faq` - Ask health questions

### 2. Frontend API Methods Added ✓
Open `/frontend/services/api.ts` - new methods ready:
```typescript
recommendationsAPI.generateRecommendations()
recommendationsAPI.getHealthScore()
aiAPI.triage(symptoms)
aiAPI.predictWaitTime(dept, position)
aiAPI.askFAQ(question)
```

### 3. UI Component Created ✓
File: `/frontend/components/AIRecommendationsPanel.tsx`
Ready to use - just import it!

---

## 🚀 Use Right Now in Your Appointments Page

### Step 1: Copy-Paste This Into appointments/page.tsx

Add this import at the top:
```typescript
import AIRecommendationsPanel from '@/components/AIRecommendationsPanel';
```

Add this in your JSX (inside the main content area):
```typescript
<AIRecommendationsPanel />
```

### Step 2: Start the servers
```bash
# Terminal 1: Backend
cd /Users/apple/Desktop/Medi_Flow/backend
npm start

# Terminal 2: Frontend  
cd /Users/apple/Desktop/Medi_Flow/frontend
npm run dev
```

### Step 3: Visit the page
- Go to http://localhost:3000
- Login as a patient
- Navigate to Appointments
- See the AI Recommendations panel at the top! 🎉

---

## 🎯 Code Examples

### Example 1: Show Health Score in a Card
```typescript
import { recommendationsAPI } from '@/services/api';
import { useState, useEffect } from 'react';

export function HealthScoreCard() {
  const [score, setScore] = useState(0);

  useEffect(() => {
    recommendationsAPI.getHealthScore()
      .then(res => setScore(res.data.score))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <p className="text-sm text-gray-600">Your Health Score</p>
      <p className="text-3xl font-bold text-blue-600">{score}/100</p>
    </div>
  );
}
```

### Example 2: Display Recommendations List
```typescript
import { recommendationsAPI } from '@/services/api';
import { useState, useEffect } from 'react';

export function RecommendationsList() {
  const [recs, setRecs] = useState([]);

  useEffect(() => {
    recommendationsAPI.generateRecommendations({ includeHistory: true })
      .then(res => setRecs(res.data.recommendations))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-2">
      {recs.map((rec, i) => (
        <div key={i} className="p-3 bg-blue-50 rounded">
          <p className="font-medium">{rec.recommendation}</p>
          <p className="text-sm text-gray-600">{rec.reason}</p>
        </div>
      ))}
    </div>
  );
}
```

### Example 3: Symptom Triage
```typescript
import { aiAPI } from '@/services/api';
import { useState } from 'react';

export function SymptomChecker() {
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState(null);

  const check = async () => {
    try {
      const res = await aiAPI.triage(symptoms.split(',').map(s => s.trim()));
      setResult(res.data.result);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="fever, cough, headache"
        value={symptoms}
        onChange={e => setSymptoms(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <button onClick={check} className="bg-blue-600 text-white px-4 py-2 rounded">
        Check Symptoms
      </button>
      {result && (
        <div className="p-4 bg-green-50 rounded">
          <p><strong>Department:</strong> {result.department}</p>
          <p><strong>Condition:</strong> {result.label}</p>
        </div>
      )}
    </div>
  );
}
```

### Example 4: Wait Time Prediction
```typescript
import { aiAPI } from '@/services/api';

async function checkWaitTime() {
  const res = await aiAPI.predictWaitTime(
    'General Medicine',  // department
    5,                   // position in queue
    2                    // active consultations
  );
  console.log('Estimated wait time:', res.data.result);
}
```

### Example 5: FAQ Chatbot
```typescript
import { aiAPI } from '@/services/api';

async function askQuestion(question) {
  const res = await aiAPI.askFAQ(question);
  console.log('Answer:', res.data.result);
  return res.data.result;
}

// Usage
const answer = await askQuestion('How do I manage diabetes?');
```

---

## 🔍 Check If Everything Works

### Test 1: Backend Health
```bash
curl http://localhost:5000/api/status/health
# Should return: {"success":true}
```

### Test 2: Get Health Score (Need valid token)
```bash
curl -X GET http://localhost:5000/api/recommendations/health-score \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Test 3: Triage API (No auth needed for testing)
```bash
curl -X POST http://localhost:5000/api/ai/triage \
  -H "Content-Type: application/json" \
  -d '{"symptoms":["fever","cough"]}'
```

---

## 📊 What Data Do You Need?

For best recommendations, user profile should include:

| Field | Example | Why Important |
|-------|---------|---------------|
| `age` | 35 | Age-specific screening and risk |
| `weight` | 75 (kg) | BMI calculation, risk assessment |
| `height` | 175 (cm) | BMI calculation |
| `gender` | "Male" | Gender-specific health risks |
| `conditions` | ["diabetes", "hypertension"] | Condition-specific recommendations |
| `exerciseFrequency` | 3 | Fitness assessment |
| `dietQuality` | "good" | Nutrition recommendations |
| `sleepHours` | 7 | Sleep health assessment |
| `stressLevel` | "moderate" | Mental health recommendations |

### How to Update User Profile
```typescript
import { authAPI } from '@/services/api';

const res = await authAPI.updateProfile({
  weight: 75,
  height: 175,
  age: 35,
  gender: 'Male',
  conditions: ['diabetes'],
  exerciseFrequency: 3,
  dietQuality: 'good',
  sleepHours: 7,
  stressLevel: 'moderate'
});
```

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot connect to backend" | Start backend: `npm start` in `/backend` |
| "401 Unauthorized" | Login first, token saved in localStorage |
| "No recommendations" | Update user profile with health data |
| Component not showing | Import it: `import AIRecommendationsPanel from '@/components/AIRecommendationsPanel'` |
| Slow loading | Recommendations cache for 30 days - first load may be slower |
| API endpoint 404 | Check backend server.js has routes mounted |

---

## 📚 Related Files

| File | Purpose |
|------|---------|
| `/frontend/services/api.ts` | API client methods (updated) |
| `/frontend/components/AIRecommendationsPanel.tsx` | Full UI component (created) |
| `/backend/controllers/recommendationsController.js` | Recommendation logic |
| `/backend/routes/recommendationsRoutes.js` | Recommendation endpoints |
| `/backend/ai/healthRecommendations.js` | AI recommendation engine |
| `/docs/AI_RECOMMENDATIONS_USAGE_GUIDE.md` | Detailed guide |
| `/docs/AI_RECOMMENDATIONS_INTEGRATION_GUIDE.md` | Integration instructions |

---

## ✅ Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Imported `AIRecommendationsPanel` in appointments page
- [ ] Added `<AIRecommendationsPanel />` to JSX
- [ ] User logged in with health profile data
- [ ] Visited appointments page and see AI panel
- [ ] Clicked "Refresh" button to load data
- [ ] Tested symptom triage in "Symptom Analysis" tab

---

## 🎓 Learn More

- **Full Usage Guide:** `/docs/AI_RECOMMENDATIONS_USAGE_GUIDE.md`
- **Integration Instructions:** `/docs/AI_RECOMMENDATIONS_INTEGRATION_GUIDE.md`
- **API Documentation:** `/docs/API_DOCUMENTATION.md`
- **Backend AI Code:** `/backend/ai/` folder

---

**Status:** ✅ Ready to Use
**Last Updated:** April 5, 2026
