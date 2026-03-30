# MediFlow Nepal — AI Module Integration Guide

## What's Inside This ZIP

```
mediflow-ai/
├── backend/
│   ├── ai/
│   │   ├── triageDecisionTree.js    ← Decision Tree algorithm
│   │   ├── triageNaiveBayes.js      ← Naive Bayes algorithm
│   │   ├── waitTimePredictor.js     ← Wait time prediction
│   │   └── faqChatbot.js            ← FAQ rule-based chatbot
│   ├── controllers/
│   │   └── aiController.js          ← Connects algorithms to routes
│   ├── routes/
│   │   └── aiRoutes.js              ← Express route definitions
│   └── SERVER_SETUP.js              ← Instructions to update server.js
│
└── frontend/
    ├── services/
    │   └── aiService.ts             ← All API calls to backend
    ├── app/
    │   └── triage/
    │       └── page.tsx             ← Full triage page UI
    └── components/
        └── ai/
            ├── FaqChatbot.tsx       ← Floating chatbot widget
            └── WaitTimeCard.tsx     ← Wait time display card
```

---

## STEP 1 — Copy Backend Files

Copy these into your existing backend folder:

```
backend/ai/triageDecisionTree.js   → your-project/backend/ai/
backend/ai/triageNaiveBayes.js     → your-project/backend/ai/
backend/ai/waitTimePredictor.js    → your-project/backend/ai/
backend/ai/faqChatbot.js           → your-project/backend/ai/
backend/controllers/aiController.js → your-project/backend/controllers/
backend/routes/aiRoutes.js          → your-project/backend/routes/
```

---

## STEP 2 — Update Your server.js

Open your existing `backend/server.js` and add exactly 2 lines:

```js
// Add near the top with your other requires:
const aiRoutes = require("./routes/aiRoutes");

// Add near your other app.use() calls:
app.use("/api/ai", aiRoutes);
```

---

## STEP 3 — Copy Frontend Files

```
frontend/services/aiService.ts          → your-project/frontend/services/
frontend/app/triage/page.tsx            → your-project/frontend/app/triage/
frontend/components/ai/FaqChatbot.tsx   → your-project/frontend/components/ai/
frontend/components/ai/WaitTimeCard.tsx → your-project/frontend/components/ai/
```

---

## STEP 4 — Add Chatbot to Your Layout

Open `frontend/app/layout.tsx` and add the chatbot so it appears on every page:

```tsx
import FaqChatbot from "@/components/ai/FaqChatbot";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <FaqChatbot />   {/* Add this line */}
      </body>
    </html>
  );
}
```

---

## STEP 5 — Add Triage Link to Patient Portal

Add a link to the triage page in your patient dashboard:

```tsx
<a href="/triage" className="...">
  AI Symptom Check
</a>
```

---

## STEP 6 — Add Wait Time Card to Queue Page

On your existing queue/token page, import and use the card:

```tsx
import WaitTimeCard from "@/components/ai/WaitTimeCard";

// Inside your component, where you show queue info:
<WaitTimeCard
  department={patient.department}   // e.g. "GENERAL_OPD"
  queuePosition={patient.position}  // e.g. 5
  activeConsultations={1}
/>
```

---

## STEP 7 — Test the API Endpoints

Use Postman or curl to verify everything works:

```bash
# Test Triage
curl -X POST http://localhost:5000/api/ai/triage \
  -H "Content-Type: application/json" \
  -d '{"symptoms": ["fever", "headache"]}'

# Test Wait Time
curl -X POST http://localhost:5000/api/ai/waittime \
  -H "Content-Type: application/json" \
  -d '{"department": "GENERAL_OPD", "queuePosition": 5}'

# Test FAQ
curl -X POST http://localhost:5000/api/ai/faq \
  -H "Content-Type: application/json" \
  -d '{"message": "what time does OPD open?"}'
```

---

## API Reference

| Endpoint | Method | Body | Returns |
|---|---|---|---|
| `/api/ai/triage` | POST | `{ symptoms: string[] }` | Department recommendation |
| `/api/ai/waittime` | POST | `{ department, queuePosition, activeConsultations? }` | Wait time estimate |
| `/api/ai/faq` | POST | `{ message: string }` | FAQ answer |

---

## No New Dependencies Needed

All AI code uses pure JavaScript/Node.js with no extra npm packages.
The frontend uses only `fetch` which is built into Next.js.

---

Built for: MediFlow Nepal — BIT Project, Texas College of Management & IT, 2025
