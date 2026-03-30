/**
 * Comprehensive API Endpoint Testing Suite
 * Tests all 14 new NLP and Recommendations endpoints
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_URL || 'http://localhost:5001';

// Test configuration
let authToken = '';
let testUserId = '';

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, text) {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

/**
 * Create test HTTP client with auth
 */
function createClient(token) {
  return {
    async get(url) {
      return axios.get(`${API_BASE_URL}${url}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    async post(url, data) {
      return axios.post(`${API_BASE_URL}${url}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    async put(url, data) {
      return axios.put(`${API_BASE_URL}${url}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  };
}

/**
 * Test result tracking
 */
class TestResults {
  constructor() {
    this.results = [];
  }

  add(endpoint, status, message, details = '') {
    this.results.push({
      endpoint,
      status,
      message,
      details,
    });
  }

  print() {
    log('cyan', '\n\n═══════════════════════════════════════════════════════');
    log('cyan', '                  TEST RESULTS SUMMARY');
    log('cyan', '═══════════════════════════════════════════════════════\n');

    const passed = this.results.filter((r) => r.status === 'PASS').length;
    const failed = this.results.filter((r) => r.status === 'FAIL').length;
    const total = this.results.length;

    this.results.forEach((result) => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      const color = result.status === 'PASS' ? 'green' : 'red';
      log(color, `${icon} ${result.endpoint}: ${result.message}`);
      if (result.details) {
        log('yellow', `   └─ ${result.details}`);
      }
    });

    log('cyan', '\n═══════════════════════════════════════════════════════');
    log('green', `✅ PASSED: ${passed}/${total}`);
    log('red', `❌ FAILED: ${failed}/${total}`);
    log('cyan', '═══════════════════════════════════════════════════════\n');
  }
}

const testResults = new TestResults();

/**
 * Setup: Authentication
 */
async function setupAuthentication() {
  try {
    log('blue', '\n🔐 Setting up authentication...');

    // Try to login with test user
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'patient@example.com',
      password: 'password123',
    });

    authToken = loginResponse.data.token;
    testUserId = loginResponse.data.user._id;

    log('green', '✅ Authentication successful');
    return true;
  } catch (error) {
    try {
      // If login fails, try to signup
      log('yellow', '⚠️  First login failed, attempting registration...');
      const signupResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        firstName: 'Test',
        lastName: 'Patient',
        email: 'testpatient' + Date.now() + '@example.com',
        password: 'password123',
        phone: '+9779800000000',
        dateOfBirth: '1990-01-15',
        gender: 'male',
      });

      authToken = signupResponse.data.token;
      testUserId = signupResponse.data.user._id;

      log('green', '✅ Registration and authentication successful');
      return true;
    } catch (signupError) {
      log('red', '❌ Authentication setup failed');
      log('yellow', `   Error: ${signupError.response?.data?.message || signupError.message}`);
      return false;
    }
  }
}

/**
 * NLP ENDPOINTS TESTS
 */

async function testNLPAnalyze(client) {
  try {
    log('blue', '\n📍 Testing: POST /api/nlp/analyze');

    const response = await client.post('/api/nlp/analyze', {
      text: 'I have severe chest pain and shortness of breath, especially during the night',
      conversationHistory: [],
    });

    if (response.data.entities && response.data.context && response.data.response) {
      log('green', '   ✅ Response structure valid');
      log(
        'yellow',
        `   └─ Entities: ${response.data.entities.symptoms?.join(', ') || 'None'}`
      );
      testResults.add(
        'POST /api/nlp/analyze',
        'PASS',
        'Medical entity extraction working',
        `Found ${response.data.entities.symptoms?.length || 0} symptoms`
      );
    } else {
      throw new Error('Invalid response structure');
    }
  } catch (error) {
    testResults.add(
      'POST /api/nlp/analyze',
      'FAIL',
      error.response?.data?.message || error.message
    );
  }
}

async function testDetectUrgency(client) {
  try {
    log('blue', '\n📍 Testing: POST /api/nlp/detect-urgency');

    const response = await client.post('/api/nlp/detect-urgency', {
      symptomDescription: 'Cannot breathe, severe chest pain, losing consciousness',
    });

    if (response.data.urgencyLevel) {
      log('green', '   ✅ Urgency level detected');
      log('yellow', `   └─ Level: ${response.data.urgencyLevel}`);
      testResults.add('POST /api/nlp/detect-urgency', 'PASS', 'Urgency detection working');
    } else {
      throw new Error('No urgency level returned');
    }
  } catch (error) {
    testResults.add(
      'POST /api/nlp/detect-urgency',
      'FAIL',
      error.response?.data?.message || error.message
    );
  }
}

async function testGetInsights(client) {
  try {
    log('blue', '\n📍 Testing: GET /api/nlp/insights');

    const response = await client.get('/api/nlp/insights');

    if (response.data) {
      log('green', '   ✅ Insights retrieved');
      log('yellow', `   └─ Data points: ${Object.keys(response.data).length}`);
      testResults.add('GET /api/nlp/insights', 'PASS', 'Conversation insights working');
    } else {
      throw new Error('No insights data');
    }
  } catch (error) {
    testResults.add(
      'GET /api/nlp/insights',
      'FAIL',
      error.response?.data?.message || error.message
    );
  }
}

async function testSuggestAppointments(client) {
  try {
    log('blue', '\n📍 Testing: POST /api/nlp/suggest-appointments');

    const response = await client.post('/api/nlp/suggest-appointments', {
      symptoms: ['chest pain', 'shortness of breath'],
    });

    if (response.data.suggestedDepartments) {
      log('green', '   ✅ Departments suggested');
      log('yellow', `   └─ Departments: ${response.data.suggestedDepartments.join(', ')}`);
      testResults.add(
        'POST /api/nlp/suggest-appointments',
        'PASS',
        'Appointment suggestions working'
      );
    } else {
      throw new Error('No departments suggested');
    }
  } catch (error) {
    testResults.add(
      'POST /api/nlp/suggest-appointments',
      'FAIL',
      error.response?.data?.message || error.message
    );
  }
}

async function testChat(client) {
  try {
    log('blue', '\n📍 Testing: POST /api/nlp/chat');

    const response = await client.post('/api/nlp/chat', {
      message: 'How can I manage my diabetes better?',
      conversationId: 'test-conv-' + Date.now(),
    });

    if (response.data.response) {
      log('green', '   ✅ Chat response received');
      log('yellow', `   └─ Response: ${response.data.response.substring(0, 50)}...`);
      testResults.add('POST /api/nlp/chat', 'PASS', 'Medical chat working');
    } else {
      throw new Error('No response received');
    }
  } catch (error) {
    testResults.add('POST /api/nlp/chat', 'FAIL', error.response?.data?.message || error.message);
  }
}

async function testFAQResponse(client) {
  try {
    log('blue', '\n📍 Testing: POST /api/nlp/faq');

    const response = await client.post('/api/nlp/faq', {
      question: 'What are the symptoms of diabetes?',
    });

    if (response.data.response) {
      log('green', '   ✅ FAQ response provided');
      log('yellow', `   └─ Confidence: ${response.data.confidence}`);
      testResults.add('POST /api/nlp/faq', 'PASS', 'FAQ matching working');
    } else {
      throw new Error('No FAQ response');
    }
  } catch (error) {
    testResults.add('POST /api/nlp/faq', 'FAIL', error.response?.data?.message || error.message);
  }
}

/**
 * RECOMMENDATIONS ENDPOINTS TESTS
 */

async function testGenerateRecommendations(client) {
  try {
    log('blue', '\n📍 Testing: GET /api/recommendations/generate');

    const response = await client.get('/api/recommendations/generate');

    if (response.data.recommendations) {
      log('green', '   ✅ Recommendations generated');
      log(
        'yellow',
        `   └─ Categories: ${Object.keys(response.data.recommendations).length}`
      );
      testResults.add(
        'GET /api/recommendations/generate',
        'PASS',
        'Recommendation generation working'
      );
    } else {
      throw new Error('No recommendations data');
    }
  } catch (error) {
    testResults.add(
      'GET /api/recommendations/generate',
      'FAIL',
      error.response?.data?.message || error.message
    );
  }
}

async function testHealthScore(client) {
  try {
    log('blue', '\n📍 Testing: GET /api/recommendations/health-score');

    const response = await client.get('/api/recommendations/health-score');

    if (response.data.healthMetrics) {
      log('green', '   ✅ Health score calculated');
      log('yellow', `   └─ Score: ${response.data.healthMetrics.healthScore}/100`);
      testResults.add(
        'GET /api/recommendations/health-score',
        'PASS',
        'Health score calculation working'
      );
    } else {
      throw new Error('No health metrics');
    }
  } catch (error) {
    testResults.add(
      'GET /api/recommendations/health-score',
      'FAIL',
      error.response?.data?.message || error.message
    );
  }
}

async function testActionPlan(client) {
  try {
    log('blue', '\n📍 Testing: GET /api/recommendations/action-plan');

    const response = await client.get('/api/recommendations/action-plan?duration=3%20months');

    if (response.data.goals) {
      log('green', '   ✅ Action plan retrieved');
      log('yellow', `   └─ Goals: ${response.data.goals.length}`);
      testResults.add(
        'GET /api/recommendations/action-plan',
        'PASS',
        'Action plan generation working'
      );
    } else {
      throw new Error('No action plan data');
    }
  } catch (error) {
    testResults.add(
      'GET /api/recommendations/action-plan',
      'FAIL',
      error.response?.data?.message || error.message
    );
  }
}

async function testRiskAssessment(client) {
  try {
    log('blue', '\n📍 Testing: GET /api/recommendations/risk-assessment');

    const response = await client.get('/api/recommendations/risk-assessment');

    if (response.data.overallRiskScore !== undefined) {
      log('green', '   ✅ Risk assessment completed');
      log('yellow', `   └─ Risk score: ${response.data.overallRiskScore}/100`);
      testResults.add(
        'GET /api/recommendations/risk-assessment',
        'PASS',
        'Risk assessment working'
      );
    } else {
      throw new Error('No risk data');
    }
  } catch (error) {
    testResults.add(
      'GET /api/recommendations/risk-assessment',
      'FAIL',
      error.response?.data?.message || error.message
    );
  }
}

async function testScreeningRecommendations(client) {
  try {
    log('blue', '\n📍 Testing: GET /api/recommendations/screenings');

    const response = await client.get('/api/recommendations/screenings');

    if (response.data.screenings) {
      log('green', '   ✅ Screening recommendations retrieved');
      log('yellow', `   └─ Screenings: ${response.data.screenings.length}`);
      testResults.add(
        'GET /api/recommendations/screenings',
        'PASS',
        'Screening recommendations working'
      );
    } else {
      throw new Error('No screening data');
    }
  } catch (error) {
    testResults.add(
      'GET /api/recommendations/screenings',
      'FAIL',
      error.response?.data?.message || error.message
    );
  }
}

async function testLifestyleRecommendations(client) {
  try {
    log('blue', '\n📍 Testing: GET /api/recommendations/lifestyle');

    const response = await client.get('/api/recommendations/lifestyle');

    if (response.data.lifestyle) {
      log('green', '   ✅ Lifestyle recommendations retrieved');
      log('yellow', `   └─ Areas: ${Object.keys(response.data.lifestyle).length}`);
      testResults.add(
        'GET /api/recommendations/lifestyle',
        'PASS',
        'Lifestyle recommendations working'
      );
    } else {
      throw new Error('No lifestyle data');
    }
  } catch (error) {
    testResults.add(
      'GET /api/recommendations/lifestyle',
      'FAIL',
      error.response?.data?.message || error.message
    );
  }
}

async function testHealthInsights(client) {
  try {
    log('blue', '\n📍 Testing: GET /api/recommendations/insights');

    const response = await client.get('/api/recommendations/insights');

    if (response.data) {
      log('green', '   ✅ Health insights retrieved');
      log('yellow', `   └─ Data points: ${Object.keys(response.data).length}`);
      testResults.add(
        'GET /api/recommendations/insights',
        'PASS',
        'Health insights generation working'
      );
    } else {
      throw new Error('No insights data');
    }
  } catch (error) {
    testResults.add(
      'GET /api/recommendations/insights',
      'FAIL',
      error.response?.data?.message || error.message
    );
  }
}

async function testUpdateHealthMetrics(client) {
  try {
    log('blue', '\n📍 Testing: PUT /api/recommendations/update-metrics');

    const response = await client.put('/api/recommendations/update-metrics', {
      weight: 75,
      bloodPressure: { systolic: 120, diastolic: 80 },
      bloodGlucose: 110,
      exerciseMinutes: 30,
    });

    if (response.data.success) {
      log('green', '   ✅ Metrics updated');
      testResults.add(
        'PUT /api/recommendations/update-metrics',
        'PASS',
        'Metric updates working'
      );
    } else {
      throw new Error('Update failed');
    }
  } catch (error) {
    testResults.add(
      'PUT /api/recommendations/update-metrics',
      'FAIL',
      error.response?.data?.message || error.message
    );
  }
}

/**
 * Main test execution
 */
async function runAllTests() {
  log('cyan', '═══════════════════════════════════════════════════════');
  log('cyan', '   🏥 MediFlow - Comprehensive API Integration Tests');
  log('cyan', '═══════════════════════════════════════════════════════');

  // Setup authentication
  const authSuccess = await setupAuthentication();
  if (!authSuccess) {
    log('red', '\n❌ Cannot proceed without authentication');
    return;
  }

  const client = createClient(authToken);

  // NLP Tests
  log('cyan', '\n\n📊 PHASE 1: NLP ENDPOINTS (6 tests)');
  log('cyan', '───────────────────────────────────────────────────────');
  await testNLPAnalyze(client);
  await new Promise((resolve) => setTimeout(resolve, 300));
  await testDetectUrgency(client);
  await new Promise((resolve) => setTimeout(resolve, 300));
  await testGetInsights(client);
  await new Promise((resolve) => setTimeout(resolve, 300));
  await testSuggestAppointments(client);
  await new Promise((resolve) => setTimeout(resolve, 300));
  await testChat(client);
  await new Promise((resolve) => setTimeout(resolve, 300));
  await testFAQResponse(client);

  // Recommendations Tests
  log('cyan', '\n\n💪 PHASE 2: RECOMMENDATIONS ENDPOINTS (8 tests)');
  log('cyan', '───────────────────────────────────────────────────────');
  await testGenerateRecommendations(client);
  await new Promise((resolve) => setTimeout(resolve, 300));
  await testHealthScore(client);
  await new Promise((resolve) => setTimeout(resolve, 300));
  await testActionPlan(client);
  await new Promise((resolve) => setTimeout(resolve, 300));
  await testRiskAssessment(client);
  await new Promise((resolve) => setTimeout(resolve, 300));
  await testScreeningRecommendations(client);
  await new Promise((resolve) => setTimeout(resolve, 300));
  await testLifestyleRecommendations(client);
  await new Promise((resolve) => setTimeout(resolve, 300));
  await testHealthInsights(client);
  await new Promise((resolve) => setTimeout(resolve, 300));
  await testUpdateHealthMetrics(client);

  // Print summary
  testResults.print();
}

// Run tests
runAllTests().catch((error) => {
  log('red', `\n❌ Test execution error: ${error.message}`);
});
