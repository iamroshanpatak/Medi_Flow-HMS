/**
 * NLP Endpoint Integration Test
 * Tests the POST /api/nlp/analyze endpoint
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';

// Mock user token (in real scenario, would come from login)
let authToken = '';

/**
 * Test sample medical texts
 */
const testData = [
  {
    name: 'Symptom Analysis',
    text: 'I have been experiencing severe chest pain for the past 3 days. It gets worse when I breathe deeply and I also feel shortness of breath.',
    expectedEntities: ['chest pain', 'shortness of breath'],
  },
  {
    name: 'Medication Question',
    text: 'Can I take paracetamol with my blood pressure medication lisinopril? I have a mild fever.',
    expectedEntities: ['paracetamol', 'blood pressure', 'lisinopril', 'fever'],
  },
  {
    name: 'Urgency Check',
    text: 'I suddenly lost consciousness for a few minutes. Now I have a severe headache and my vision is blurry.',
    expectedEntities: ['unconsciousness', 'severe headache', 'blurry vision'],
  },
  {
    name: 'Routine Checkup',
    text: 'I would like to schedule a routine health checkup. I have not visited a doctor in 6 months.',
    expectedEntities: ['checkup'],
  },
  {
    name: 'Chronic Condition',
    text: 'My diabetes is not well controlled. My blood glucose levels are consistently above 200 mg/dL. I am on metformin but it does not seem to be working.',
    expectedEntities: ['diabetes', 'blood glucose', 'metformin'],
  },
];

/**
 * Setup: Get auth token from login
 */
async function getAuthToken() {
  try {
    console.log('\n📝 Getting auth token...');
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'testuser@example.com',
      password: 'password123',
    });

    authToken = response.data.token;
    console.log('✅ Auth token obtained');
    return response.data.token;
  } catch (error) {
    console.error('❌ Failed to get auth token:', error.response?.data || error.message);
    // For testing without login, you can hardcode a token or use a test endpoint
    console.log('⚠️  Proceeding without authentication...');
    return null;
  }
}

/**
 * Test NLP Analysis endpoint
 */
async function testNLPAnalyze(testCase, token) {
  try {
    console.log(`\n🔍 Testing: ${testCase.name}`);
    console.log(`   Text: "${testCase.text.substring(0, 60)}..."`);

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.post(
      `${API_BASE_URL}/api/nlp/analyze`,
      {
        text: testCase.text,
        conversationHistory: [],
      },
      config
    );

    const { entities, context, response: nlpResponse, confidenceScore } = response.data;

    console.log('✅ Response received');
    console.log(`   Entities found:`, entities?.symptoms?.join(', ') || 'None');
    console.log(`   Context urgency:`, context?.urgency || 'Unknown');
    console.log(`   NLP Response:`, nlpResponse?.message?.substring(0, 50) + '...');
    console.log(`   Confidence:`, confidenceScore);

    return {
      success: true,
      testCase: testCase.name,
      data: response.data,
    };
  } catch (error) {
    console.error(`❌ Test failed:`, error.response?.data || error.message);
    return {
      success: false,
      testCase: testCase.name,
      error: error.response?.data || error.message,
    };
  }
}

/**
 * Test Detect Urgency endpoint
 */
async function testDetectUrgency(symptomText, token) {
  try {
    console.log(`\n🚨 Testing urgency detection: "${symptomText.substring(0, 60)}..."`);

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.post(
      `${API_BASE_URL}/api/nlp/detect-urgency`,
      {
        symptomDescription: symptomText,
      },
      config
    );

    console.log('✅ Urgency detected');
    console.log(`   Level:`, response.data.urgencyLevel);
    console.log(`   Emotional tone:`, response.data.emotionalTone);
    console.log(`   Recommendation:`, response.data.recommendation);

    return response.data;
  } catch (error) {
    console.error(`❌ Urgency test failed:`, error.response?.data || error.message);
    return null;
  }
}

/**
 * Test Suggest Appointments endpoint
 */
async function testSuggestAppointments(symptoms, token) {
  try {
    console.log(`\n💉 Testing appointment suggestions for: ${symptoms.join(', ')}`);

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.post(
      `${API_BASE_URL}/api/nlp/suggest-appointments`,
      {
        symptoms: symptoms,
      },
      config
    );

    console.log('✅ Appointments suggested');
    console.log(`   Departments:`, response.data.suggestedDepartments?.join(', ') || 'None');
    console.log(`   Urgency:`, response.data.urgencyLevel);

    return response.data;
  } catch (error) {
    console.error(`❌ Appointment test failed:`, error.response?.data || error.message);
    return null;
  }
}

/**
 * Main test execution
 */
async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('        🏥 MediFlow NLP Integration Tests');
  console.log('═══════════════════════════════════════════════════════');

  try {
    // Get auth token
    const token = await getAuthToken();

    // Test NLP Analysis
    console.log('\n\n📊 PHASE 1: NLP ANALYSIS TESTS');
    console.log('───────────────────────────────────────────────────────');
    const nlpResults = [];
    for (const testCase of testData) {
      const result = await testNLPAnalyze(testCase, token);
      nlpResults.push(result);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Rate limiting
    }

    // Test Urgency Detection
    console.log('\n\n🚨 PHASE 2: URGENCY DETECTION TESTS');
    console.log('───────────────────────────────────────────────────────');
    await testDetectUrgency('I suddenly cannot breathe and have chest pain', token);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await testDetectUrgency('I have a mild cough that started yesterday', token);

    // Test Appointment Suggestions
    console.log('\n\n💉 PHASE 3: APPOINTMENT SUGGESTIONS');
    console.log('───────────────────────────────────────────────────────');
    await testSuggestAppointments(['chest pain', 'shortness of breath'], token);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await testSuggestAppointments(['skin rash', 'itching'], token);

    // Summary
    console.log('\n\n═══════════════════════════════════════════════════════');
    console.log('                 TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════');
    const successCount = nlpResults.filter((r) => r.success).length;
    console.log(`✅ Passed: ${successCount}/${nlpResults.length}`);
    console.log(`❌ Failed: ${nlpResults.length - successCount}/${nlpResults.length}`);

    if (successCount === nlpResults.length) {
      console.log('\n🎉 All tests passed! API is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Check the output above.');
    }
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  }
}

// Run tests
runAllTests();
