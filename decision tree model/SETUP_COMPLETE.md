# MediFlow AI - Setup Complete ✅

## Project Overview
MediFlow AI is a web-based patient triage system that uses AI algorithms to recommend the appropriate hospital department based on patient symptoms.

## What Was Fixed

### 1. **Missing Configuration Files**
   - ✅ Created `package.json` files for both backend and frontend
   - ✅ Created `tsconfig.json`, `next.config.js`, `tailwind.config.js`, `postcss.config.js`
   - ✅ Created `.env` for backend configuration

### 2. **Frontend Setup**
   - ✅ Installed React, Next.js, TypeScript, and Tailwind CSS dependencies
   - ✅ Created necessary layout files (`app/layout.tsx`, `app/globals.css`)
   - ✅ Built reusable components: `TriageForm.tsx`, `TriageResult.tsx`, `TriagePage.tsx`
   - ✅ Created `aiService.ts` for backend API communication

### 3. **Backend Setup**
   - ✅ Installed Express, CORS, and Dotenv dependencies
   - ✅ Created `server.js` with proper Express configuration
   - ✅ Connected AI routes to the main server

### 4. **Code Fixes**
   - ✅ Fixed TypeScript import naming conflicts
   - ✅ Ensured proper component exports and imports
   - ✅ Fixed syntax errors in React component files

## Running the Application

### Current Status
- **Backend Server**: Running on `http://localhost:5001`
- **Frontend Server**: Running on `http://localhost:3000/triage`

### Access the Application
Open your browser and navigate to:
```
http://localhost:3000/triage
```

### How to Use
1. **Select Symptoms**: Click on common symptoms or type a custom symptom
2. **Submit**: Click "Get Triage Recommendation" button
3. **View Results**: The AI will analyze symptoms and recommend a department
4. **Reset**: Click "Start Over" to submit new symptoms

## API Endpoints

### Backend Routes (http://localhost:5001/api/ai)
- `POST /triage` - Get department recommendation based on symptoms
- `POST /waittime` - Predict wait time for a department
- `POST /faq` - Get FAQ chatbot responses

## Project Structure

```
mediflow-ai/
├── backend/
│   ├── server.js
│   ├── routes/aiRoutes.js
│   ├── controllers/aiController.js
│   ├── ai/
│   │   ├── triageDecisionTree.js
│   │   ├── triageNaiveBayes.js
│   │   ├── waitTimePredictor.js
│   │   └── faqChatbot.js
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── triage/
│   │       ├── page.tsx
│   │       └── layout.tsx
│   ├── components/
│   │   └── ai/
│   │       ├── TriagePage.tsx
│   │       ├── TriageForm.tsx
│   │       └── TriageResult.tsx
│   ├── services/
│   │   └── aiService.ts
│   └── package.json
│
└── README.md
```

## Technologies Used

### Backend
- **Express.js**: Web framework
- **Node.js**: JavaScript runtime
- **CORS**: Cross-origin resource sharing

### Frontend
- **Next.js 14**: React framework
- **React 18**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework

## AI Algorithms

The system uses two complementary algorithms for triage:

1. **Decision Tree Algorithm**: Rule-based symptom matching
2. **Naive Bayes Classifier**: Probabilistic classification

Both algorithms are run and compared, with enhanced confidence when they agree.

## Stopping the Servers

### Backend
```bash
# Press Ctrl+C in the backend terminal
```

### Frontend
```bash
# Press Ctrl+C in the frontend terminal
```

## Troubleshooting

### Port Already in Use
If you see "EADDRINUSE" error:
```bash
# Backend on different port:
PORT=5002 npm start

# Frontend on different port:
PORT=3001 npm run dev
```

Then update the API URL in frontend's environment variable.

### Dependencies Not Installed
```bash
# Frontend
cd frontend && npm install

# Backend
cd backend && npm install
```

### TypeScript Errors
These are development warnings and won't prevent the app from running.

---

**Status**: ✅ Application is fully functional and running!
