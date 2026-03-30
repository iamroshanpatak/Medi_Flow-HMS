const axios = require('axios');

const API_URL = 'http://localhost:5001';

async function runTests() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('   🏥 MediFlow - Full Endpoint Test Suite');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Step 1: Register user
    console.log('📝 Step 1: Registering test user...');
    const email = 'testuser' + Date.now() + '@example.com';
    const signupRes = await axios.post(`${API_URL}/api/auth/register`, {
      firstName: 'Test',
      lastName: 'User',
      email: email,
      password: 'password123',
      phone: '+9779800000000',
      gender: 'male'
    });
    const token = signupRes.data.token;
    console.log('✅ User registered successfully\n');

    // Setup axios with auth header
    const client = axios.create({
      baseURL: API_URL,
      headers: { Authorization: `Bearer ${token}` }
    });

    // Step 2: Test NLP endpoints
    console.log('📊 Step 2: Testing NLP Endpoints (6 total)\n');
    const nlpTests = [
      {
        name: 'POST /api/nlp/analyze',
        fn: () => client.post('/api/nlp/analyze', { text: 'I have chest pain and shortness of breath' })
      },
      {
        name: 'POST /api/nlp/detect-urgency',
        fn: () => client.post('/api/nlp/detect-urgency', { symptomDescription: 'Severe chest pain' })
      },
      {
        name: 'GET /api/nlp/insights',
        fn: () => client.get('/api/nlp/insights')
      },
      {
        name: 'POST /api/nlp/suggest-appointments',
        fn: () => client.post('/api/nlp/suggest-appointments', { symptoms: ['chest pain'] })
      },
      {
        name: 'POST /api/nlp/chat',
        fn: () => client.post('/api/nlp/chat', { message: 'How do I manage diabetes?' })
      },
      {
        name: 'POST /api/nlp/faq',
        fn: () => client.post('/api/nlp/faq', { question: 'How do I schedule an appointment?' })
      }
    ];

    let nlpPassed = 0;
    for (const test of nlpTests) {
      try {
        const res = await test.fn();
        console.log(`✅ ${test.name}`);
        nlpPassed++;
      } catch (err) {
        console.log(`❌ ${test.name} - ${err.response?.status || err.message}`);
      }
    }
    console.log(`\n   Result: ${nlpPassed}/${nlpTests.length} NLP endpoints passed\n`);

    // Step 3: Test Recommendations endpoints
    console.log('💪 Step 3: Testing Recommendations Endpoints (8 total)\n');
    const recTests = [
      {
        name: 'GET /api/recommendations/generate',
        fn: () => client.get('/api/recommendations/generate')
      },
      {
        name: 'GET /api/recommendations/health-score',
        fn: () => client.get('/api/recommendations/health-score')
      },
      {
        name: 'GET /api/recommendations/action-plan',
        fn: () => client.get('/api/recommendations/action-plan')
      },
      {
        name: 'GET /api/recommendations/risk-assessment',
        fn: () => client.get('/api/recommendations/risk-assessment')
      },
      {
        name: 'GET /api/recommendations/screenings',
        fn: () => client.get('/api/recommendations/screenings')
      },
      {
        name: 'GET /api/recommendations/lifestyle',
        fn: () => client.get('/api/recommendations/lifestyle')
      },
      {
        name: 'GET /api/recommendations/insights',
        fn: () => client.get('/api/recommendations/insights')
      },
      {
        name: 'PUT /api/recommendations/update-metrics',
        fn: () => client.put('/api/recommendations/update-metrics', { metrics: { weight: 70 } })
      }
    ];

    let recPassed = 0;
    for (const test of recTests) {
      try {
        const res = await test.fn();
        console.log(`✅ ${test.name}`);
        recPassed++;
      } catch (err) {
        console.log(`❌ ${test.name} - ${err.response?.status || err.message}`);
      }
    }
    console.log(`\n   Result: ${recPassed}/${recTests.length} Recommendations endpoints passed\n`);

    // Final Summary
    const totalPassed = nlpPassed + recPassed;
    const totalTests = nlpTests.length + recTests.length;
    const percentage = Math.round((totalPassed / totalTests) * 100);

    console.log('═══════════════════════════════════════════════════════');
    console.log('                   FINAL RESULTS');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`\n✅ PASSED: ${totalPassed}/${totalTests} endpoints (${percentage}%)`);
    console.log(`❌ FAILED: ${totalTests - totalPassed}/${totalTests} endpoints\n`);

    if (totalPassed === totalTests) {
      console.log('🎉 ALL TESTS PASSED! System is production-ready!\n');
    } else {
      console.log(`⚠️  ${totalTests - totalPassed} endpoint(s) need attention\n`);
    }

  } catch (error) {
    console.error('❌ Test suite error:', error.message);
  }

  process.exit(0);
}

runTests();
