# Integration Guide: AI Recommendations in Appointments Page

## Quick Setup

### Step 1: Import the Component in Your Appointments Page

Add this import to the top of `/frontend/app/patient/appointments/page.tsx`:

```typescript
import AIRecommendationsPanel from '@/components/AIRecommendationsPanel';
```

### Step 2: Add the Component to Your Page Layout

Example placement in your appointments page:

```typescript
export default function AppointmentsPage() {
  // ... existing state and logic ...

  return (
    <ProtectedRoute requiredRole="patient">
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <Navbar />
          <div className="p-6 space-y-6">
            
            {/* AI RECOMMENDATIONS SECTION */}
            <AIRecommendationsPanel />
            
            {/* Your existing appointments content below */}
            <div className="bg-white rounded-lg shadow">
              {/* Existing appointment UI */}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
```

## Usage Examples

### Option 1: Full Panel (Recommended for Dashboard)
Shows health score, recommendations, and triage analyzer.

```typescript
import AIRecommendationsPanel from '@/components/AIRecommendationsPanel';

export default function DashboardPage() {
  return (
    <div className="p-6">
      <AIRecommendationsPanel />
    </div>
  );
}
```

### Option 2: Health Score Only
For minimal space, show just the health score:

```typescript
import { recommendationsAPI } from '@/services/api';

function HealthScoreCard() {
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    recommendationsAPI.getHealthScore()
      .then(res => setScore(res.data.score))
      .catch(err => console.error(err));
  }, []);

  return (
    score && (
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
        <p className="text-sm text-gray-600">Health Score</p>
        <p className="text-3xl font-bold text-blue-600">{score}/100</p>
      </div>
    )
  );
}
```

### Option 3: Recommendations Only
For a sidebar widget:

```typescript
function RecommendationsList() {
  const [recommendations, setRecommendations] = useState<any>(null);

  useEffect(() => {
    recommendationsAPI.generateRecommendations({ includeHistory: true })
      .then(res => setRecommendations(res.data.recommendations))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">AI Recommendations</h3>
      {recommendations?.map((rec: any, idx: number) => (
        <div key={idx} className="p-2 bg-blue-50 rounded text-sm">
          <p className="font-medium">{rec.recommendation}</p>
          <p className="text-xs text-gray-600">{rec.reason}</p>
        </div>
      ))}
    </div>
  );
}
```

## API Methods Available

All methods require user authentication via Bearer token (automatically handled by the API service).

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `generateRecommendations(params?)` | `GET /api/recommendations/generate` | Get personalized health recommendations |
| `getHealthScore()` | `GET /api/recommendations/health-score` | Get user's health score (0-100) |
| `getActionPlan()` | `GET /api/recommendations/action-plan` | Get personalized action plan |
| `getRiskAssessment()` | `GET /api/recommendations/risk-assessment` | Get risk assessment |
| `getScreeningRecommendations()` | `GET /api/recommendations/screenings` | Get screening recommendations |
| `getLifestyleRecommendations()` | `GET /api/recommendations/lifestyle` | Get lifestyle tips |
| `getHealthInsights()` | `GET /api/recommendations/insights` | Get health insights |
| `triage(symptoms)` | `POST /api/ai/triage` | Get department recommendation |
| `predictWaitTime(dept, pos, consult?)` | `POST /api/ai/waittime` | Predict wait time |
| `askFAQ(message)` | `POST /api/ai/faq` | Ask health questions |

## Backend Routes

Make sure these routes are mounted in your backend server.js:

```javascript
// In backend/server.js
const recommendationsRoutes = require('./routes/recommendationsRoutes');
const aiRoutes = require('./routes/aiRoutes');

app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/ai', aiRoutes);
```

Check your backend/server.js to confirm these are included. If not, add them:

```javascript
// Example server.js setup
const express = require('express');
const app = express();

// ... other middleware ...

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/users', require('./routes/users'));
app.use('/api/medical-records', require('./routes/medicalRecords'));
app.use('/api/queue', require('./routes/queue'));
app.use('/api/status', require('./routes/status'));
app.use('/api/recommendations', require('./routes/recommendationsRoutes'));  // ADD THIS
app.use('/api/ai', require('./routes/aiRoutes'));  // ADD THIS

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
```

## Environment Variables

Ensure `.env.local` in frontend has:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Testing the Integration

### 1. Start Backend Server
```bash
cd /Users/apple/Desktop/Medi_Flow/backend
npm install
npm start
# Should see: "Server running on port 5000"
```

### 2. Start Frontend Server
```bash
cd /Users/apple/Desktop/Medi_Flow/frontend
npm install
npm run dev
# Frontend running on http://localhost:3000
```

### 3. Test the APIs
```bash
# Test health score endpoint
curl -X GET http://localhost:5000/api/recommendations/health-score \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Test triage endpoint
curl -X POST http://localhost:5000/api/ai/triage \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"symptoms": ["fever", "cough"]}'
```

## Troubleshooting

### Issue: Component shows "Error Loading Recommendations"
**Solution:**
1. Check backend is running: `curl http://localhost:5000/api/status/health`
2. Verify authentication token is valid
3. Check user profile has health data entered
4. Look at browser console for details

### Issue: "Network Error: Cannot connect to backend"
**Solution:**
1. Ensure `NEXT_PUBLIC_API_URL=http://localhost:5000` in `.env.local`
2. Verify backend port is 5000: `lsof -i :5000`
3. Restart frontend: Press Ctrl+C and `npm run dev` again

### Issue: No recommendations generated
**Solution:**
1. Update user profile with health information (weight, height, conditions, etc.)
2. Add medical records with test results
3. Run seed data: `cd backend && npm run seed`

### Issue: Health score is 0 or undefined
**Solution:**
1. User model must have these fields populated:
   - weight, height, age, gender
   - exerciseFrequency, dietQuality
   - sleepHours, stressLevel
2. Update profile to include this data

## Performance Tips

1. **Cache recommendations** - Recommendations are valid for 30 days, cache on frontend
2. **Use conditional rendering** - Only show recommendations if data is available
3. **Debounce refreshes** - Don't refresh more than once per 5 minutes
4. **Optimize API calls** - Use `includeHistory: false` for faster responses

## Next Steps

1. Customize colors and styling to match your design system
2. Add recommendations to doctor dashboard
3. Create a dedicated health insights page
4. Set up notifications for high-priority recommendations
5. Integrate with appointment scheduling logic

---

**Created:** April 5, 2026
**Component Location:** `frontend/components/AIRecommendationsPanel.tsx`
