// MediFlow Nepal — AI Routes
// backend/routes/aiRoutes.js

const express = require("express");
const router = express.Router();
const { triage, waitTime, faq } = require("../controllers/aiController");

// POST /api/ai/triage     — symptom → department routing
// POST /api/ai/waittime   — predict patient wait time
// POST /api/ai/faq        — FAQ chatbot

router.post("/triage", triage);
router.post("/waittime", waitTime);
router.post("/faq", faq);

module.exports = router;
