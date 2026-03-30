// backend/routes/nlpRoutes.js
// Routes for Advanced NLP endpoints
const express = require('express');
const router = express.Router();
const nlpController = require('../controllers/nlpController');
const { protect } = require('../middleware/auth');

/**
 * POST /api/nlp/analyze
 * Analyze medical text and extract medical entities
 */
router.post('/analyze', protect, nlpController.analyzeText);

/**
 * POST /api/nlp/detect-urgency
 * Detect urgency level from symptom description
 */
router.post('/detect-urgency', protect, nlpController.detectUrgency);

/**
 * GET /api/nlp/insights
 * Get conversation insights from historical interactions
 */
router.get('/insights', protect, nlpController.getConversationInsights);

/**
 * POST /api/nlp/suggest-appointments
 * Get appointment suggestions based on symptoms
 */
router.post('/suggest-appointments', protect, nlpController.suggestAppointments);

/**
 * POST /api/nlp/chat
 * Interactive medical chatbot endpoint
 */
router.post('/chat', protect, nlpController.chat);

/**
 * POST /api/nlp/faq
 * Get FAQ responses for common questions
 */
router.post('/faq', protect, nlpController.getFAQResponse);

module.exports = router;
