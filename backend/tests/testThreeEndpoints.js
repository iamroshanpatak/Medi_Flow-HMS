const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function runTests() {
  try {
    console.log('Testing 3 previously failing endpoints...\n');
    
    // Sign up
    const signup = await axios.post(`${BASE_URL}/api/auth/register`, {
      firstName: 'Test',
      lastName: 'User',
      email: 'patient' + Date.now() + '@test.com',
      password: 'password123',
      phone: '+9779800000000',
      gender: 'male'
    });
    const token = signup.data.token;
    console.log('✅ Authenticated\n');

    // Test 1: suggest-appointments
    try {
      const apt = await axios.post(`${BASE_URL}/api/nlp/suggest-appointments`, 
        { symptoms: ['chest pain'] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('✅ POST /api/nlp/suggest-appointments: PASS');
      console.log(`   └─ Departments: ${apt.data.suggestions.length}`);
    } catch (e) {
      console.log('❌ POST /api/nlp/suggest-appointments: FAIL');
      console.log(`   └─ Status: ${e.response?.status}, Message: ${e.response?.data?.error}`);
    }

    // Test 2: FAQ
    try {
      const faq = await axios.post(`${BASE_URL}/api/nlp/faq`, 
        { query: 'how to schedule' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('✅ POST /api/nlp/faq: PASS');
      console.log(`   └─ Response: "${faq.data.response.substring(0, 50)}..."`);
    } catch (e) {
      console.log('❌ POST /api/nlp/faq: FAIL');
      console.log(`   └─ Status: ${e.response?.status}`);
    }

    // Test 3: risk-assessment
    try {
      const risk = await axios.get(`${BASE_URL}/api/recommendations/risk-assessment`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('✅ GET /api/recommendations/risk-assessment: PASS');
      console.log(`   └─ Risk Score: ${risk.data.riskScore}`);
    } catch (e) {
      console.log('❌ GET /api/recommendations/risk-assessment: FAIL');
      console.log(`   └─ Status: ${e.response?.status}, Error: ${e.response?.data?.error}`);
    }

    console.log('\n✅ Test completed!');
  } catch (err) {
    console.error('Setup error:', err.message);
  }
  process.exit(0);
}

runTests();
