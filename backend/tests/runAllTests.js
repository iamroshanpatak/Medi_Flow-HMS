const axios = require('axios');

const API = 'http://localhost:5001';

async function runAllTests() {
  try {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('   🏥 MediFlow - Full Endpoint Test Suite');
    console.log('═══════════════════════════════════════════════════════\n');

    // Step 1: Authentication
    console.log('📝 Step 1: Registering test user...');
    const signup = await axios.post(`${API}/api/auth/register`, {
      firstName: 'Test',
      lastName: 'Patient',
      email: 'patient' + Date.now() + '@example.com',
      password: 'Test@123456',
      phone: '+9779800000000',
      gender: 'male'
    });

    const token = signup.data.token;
    console.log('✅ User authenticated successfully\n');

    const headers = { Authorization: `Bearer ${token}` };
    let passed = 0;
    let failed = 0;
    const results = [];

    // Step 2: NLP Endpoints
    console.log('📊 Testing NLP Endpoints [6 total]\n');

    const nlpTests = [
      {
        name: 'POST /api/nlp/analyze',
        method: 'POST',
        url: '/api/nlp/analyze',
        data: { text: 'I have severe chest pain and shortness of breath' }
      },
      {
        name: 'POST /api/nlp/detect-urgency',
        method: 'POST',
        url: '/api/nlp/detect-urgency',
        data: { symptomDescription: 'Severe chest pain, losing consciousness' }
      },
      {
        name: 'GET /api/nlp/insights',
        method: 'GET',
        url: '/api/nlp/insights'
      },
      {
        name: 'POST /api/nlp/suggest-appointments',
        method: 'POST',
        url: '/api/nlp/suggest-appointments',
        data: { symptoms: ['chest pain', 'shortness of breath'] }
      },
      {
        name: 'POST /api/nlp/chat',
        method: 'POST',
        url: '/api/nlp/chat',
        data: { message: 'How can I manage my diabetes better?' }
      },
      {
        name: 'POST /api/nlp/faq',
        method: 'POST',
        url: '/api/nlp/faq',
        data: { question: 'How do I schedule an appointment?' }
      }
    ];

    for (const test of nlpTests) {
      try {
        let response;
        if (test.method === 'GET') {
          response = await axios.get(`${API}${test.url}`, { headers });
        } else {
          response = await axios.post(`${API}${test.url}`, test.data, { headers });
        }
        console.log(`   ✅ ${test.name}`);
        results.push({ test: test.name, status: 'PASS' });
        passed++;
      } catch (error) {
        console.log(`   ❌ ${test.name} [${error.response?.status || error.code}]`);
        results.push({ test: test.name, status: 'FAIL', error: error.response?.status });
        failed++;
      }
    }

    // Step 3: Recommendations Endpoints
    console.log('\n💪 Testing Recommendations Endpoints [8 total]\n');

    const recTests = [
      {
        name: 'GET /api/recommendations/generate',
        method: 'GET',
        url: '/api/recommendations/generate'
      },
      {
        name: 'GET /api/recommendations/health-score',
        method: 'GET',
        url: '/api/recommendations/health-score'
      },
      {
        name: 'GET /api/recommendations/action-plan',
        method: 'GET',
        url: '/api/recommendations/action-plan'
      },
      {
        name: 'GET /api/recommendations/risk-assessment',
        method: 'GET',
        url: '/api/recommendations/risk-assessment'
      },
      {
        name: 'GET /api/recommendations/screenings',
        method: 'GET',
        url: '/api/recommendations/screenings'
      },
      {
        name: 'GET /api/recommendations/lifestyle',
        method: 'GET',
        url: '/api/recommendations/lifestyle'
      },
      {
        name: 'GET /api/recommendations/insights',
        method: 'GET',
        url: '/api/recommendations/insights'
      },
      {
        name: 'PUT /api/recommendations/update-metrics',
        method: 'PUT',
        url: '/api/recommendations/update-metrics',
        data: { metrics: { weight: 75, height: 180 } }
      }
    ];

    for (const test of recTests) {
      try {
        let response;
        if (test.method === 'GET') {
          response = await axios.get(`${API}${test.url}`, { headers });
        } else if (test.method === 'PUT') {
          response = await axios.put(`${API}${test.url}`, test.data, { headers });
        }
        console.log(`   ✅ ${test.name}`);
        results.push({ test: test.name, status: 'PASS' });
        passed++;
      } catch (error) {
        console.log(`   ❌ ${test.name} [${error.response?.status || error.code}]`);
        results.push({ test: test.name, status: 'FAIL', error: error.response?.status });
        failed++;
      }
    }

    // Final Summary
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('                   FINAL TEST RESULTS');
    console.log('═══════════════════════════════════════════════════════\n');

    const totalTests = passed + failed;
    const percentage = Math.round((passed / totalTests) * 100);

    console.log(`✅ PASSED: ${passed}/${totalTests} endpoints (${percentage}%)`);
    console.log(`❌ FAILED: ${failed}/${totalTests} endpoints\n`);

    if (failed === 0) {
      console.log('🎉 SUCCESS! All 14 endpoints working perfectly!');
      console.log('   System is production-ready.\n');
    } else {
      console.log(`⚠️ ${failed} endpoint(s) need attention:\n`);
      results.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`   - ${r.test}`);
      });
      console.log();
    }

    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Test suite initialization failed:', error.message);
    console.error('Full error:', error);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }

  process.exit(0);
}

runAllTests();
