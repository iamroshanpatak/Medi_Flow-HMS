const axios = require('axios');

/**
 * Run all endpoint tests and return results
 */
async function runEndpointTests() {
  const API = 'http://localhost:5001';
  const results = {
    nlp: [],
    recommendations: [],
    timestamp: new Date().toISOString()
  };

  try {
    // Register test user
    const signup = await axios.post(`${API}/api/auth/register`, {
      firstName: 'Status',
      lastName: 'Check',
      email: `status${Date.now()}@test.com`,
      password: 'Status@12345',
      phone: '+9779800000000',
      gender: 'male'
    });

    const token = signup.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    // Test NLP endpoints
    const nlpTests = [
      { name: 'analyze', method: 'POST', url: '/api/nlp/analyze', data: { text: 'test' } },
      { name: 'detect-urgency', method: 'POST', url: '/api/nlp/detect-urgency', data: { symptomDescription: 'test' } },
      { name: 'insights', method: 'GET', url: '/api/nlp/insights' },
      { name: 'suggest-appointments', method: 'POST', url: '/api/nlp/suggest-appointments', data: { symptoms: ['test'] } },
      { name: 'chat', method: 'POST', url: '/api/nlp/chat', data: { message: 'test' } },
      { name: 'faq', method: 'POST', url: '/api/nlp/faq', data: { question: 'test' } }
    ];

    for (const test of nlpTests) {
      try {
        const start = Date.now();
        if (test.method === 'GET') {
          await axios.get(`${API}${test.url}`, { headers });
        } else {
          await axios.post(`${API}${test.url}`, test.data, { headers });
        }
        results.nlp.push({
          endpoint: test.name,
          status: 'PASS',
          time: Date.now() - start
        });
      } catch (e) {
        results.nlp.push({
          endpoint: test.name,
          status: 'FAIL',
          error: e.response?.status || e.code
        });
      }
    }

    // Test Recommendations endpoints
    const recTests = [
      { name: 'generate', url: '/api/recommendations/generate' },
      { name: 'health-score', url: '/api/recommendations/health-score' },
      { name: 'action-plan', url: '/api/recommendations/action-plan' },
      { name: 'risk-assessment', url: '/api/recommendations/risk-assessment' },
      { name: 'screenings', url: '/api/recommendations/screenings' },
      { name: 'lifestyle', url: '/api/recommendations/lifestyle' },
      { name: 'insights', url: '/api/recommendations/insights' },
      { name: 'update-metrics', method: 'PUT', url: '/api/recommendations/update-metrics', data: { metrics: {} } }
    ];

    for (const test of recTests) {
      try {
        const start = Date.now();
        const method = test.method || 'GET';
        if (method === 'GET') {
          await axios.get(`${API}${test.url}`, { headers });
        } else if (method === 'PUT') {
          await axios.put(`${API}${test.url}`, test.data, { headers });
        }
        results.recommendations.push({
          endpoint: test.name,
          status: 'PASS',
          time: Date.now() - start
        });
      } catch (e) {
        results.recommendations.push({
          endpoint: test.name,
          status: 'FAIL',
          error: e.response?.status || e.code
        });
      }
    }

  } catch (error) {
    results.error = error.message;
  }

  return results;
}

/**
 * Get system status
 */
exports.getStatus = async (req, res) => {
  try {
    const testResults = await runEndpointTests();
    
    const nlpPassed = testResults.nlp.filter(t => t.status === 'PASS').length;
    const recPassed = testResults.recommendations.filter(t => t.status === 'PASS').length;
    const totalPassed = nlpPassed + recPassed;
    const totalTests = testResults.nlp.length + testResults.recommendations.length;

    return res.status(200).json({
      success: true,
      message: 'System Status Report',
      timestamp: testResults.timestamp,
      overall: {
        status: totalPassed === totalTests ? 'HEALTHY' : 'WARNING',
        totalTests,
        passed: totalPassed,
        failed: totalTests - totalPassed,
        percentage: Math.round((totalPassed / totalTests) * 100)
      },
      endpoints: {
        nlp: {
          total: testResults.nlp.length,
          passed: nlpPassed,
          failed: testResults.nlp.length - nlpPassed,
          tests: testResults.nlp
        },
        recommendations: {
          total: testResults.recommendations.length,
          passed: recPassed,
          failed: testResults.recommendations.length - recPassed,
          tests: testResults.recommendations
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Quick health check (no detailed tests)
 */
exports.quickHealth = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'API is operational',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
