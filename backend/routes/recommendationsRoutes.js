// backend/routes/recommendationsRoutes.js
// Routes for Health Recommendations endpoints
const express = require('express');
const router = express.Router();
const recommendationsController = require('../controllers/recommendationsController');
const { protect } = require('../middleware/auth');

/**
 * GET /api/recommendations/generate
 * Generate personalized health recommendations
 */
router.get('/generate', protect, recommendationsController.generateRecommendations);

/**
 * GET /api/recommendations/health-score
 * Get current health score and metrics
 */
router.get('/health-score', protect, recommendationsController.getHealthScore);

/**
 * GET /api/recommendations/action-plan
 * Get personalized action plan for health goals
 */
router.get('/action-plan', protect, recommendationsController.getActionPlan);

/**
 * GET /api/recommendations/risk-assessment
 * Get comprehensive risk assessment
 */
router.get('/risk-assessment', protect, recommendationsController.getRiskAssessment);

/**
 * GET /api/recommendations/screenings
 * Get screening recommendations based on age and health status
 */
router.get('/screenings', protect, recommendationsController.getScreeningRecommendations);

/**
 * GET /api/recommendations/lifestyle
 * Get personalized lifestyle recommendations
 */
router.get('/lifestyle', protect, recommendationsController.getLifestyleRecommendations);

/**
 * GET /api/recommendations/insights
 * Get personalized health insights from patient history
 */
router.get('/insights', protect, recommendationsController.getHealthInsights);

/**
 * PUT /api/recommendations/update-metrics
 * Update health metrics and regenerate recommendations
 */
router.put('/update-metrics', protect, recommendationsController.updateHealthMetrics);

module.exports = router;
