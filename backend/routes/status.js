const express = require('express');
const { getStatus, quickHealth } = require('../controllers/statusController');

const router = express.Router();

/**
 * Quick health check (no auth required)
 */
router.get('/health', quickHealth);

/**
 * Full system status report with endpoint tests
 */
router.get('/status', getStatus);

module.exports = router;
