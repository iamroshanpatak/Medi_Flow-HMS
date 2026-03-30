const axios = require('axios');

const API = 'http://localhost:5001';

async function systemHealthCheck() {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║       🏥 MediFlow System Health Check Report          ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  const checks = {
    'Backend Service': { status: false, time: 0 },
    'Database Connection': { status: false, time: 0 },
    'Authentication Service': { status: false, time: 0 },
    'NLP Endpoints': { status: false, time: 0 },
    'Recommendations Endpoints': { status: false, time: 0 },
    'API Response Time': { status: false, time: 0 }
  };

  try {
    // Check 1: Backend connectivity
    const start1 = Date.now();
    try {
      const res = await axios.get(`${API}/`, { timeout: 5000 });
      checks['Backend Service'].status = false; // No root endpoint
    } catch (e) {
      if (e.code === 'ECONNREFUSED') {
        checks['Backend Service'].status = false;
      } else {
        checks['Backend Service'].status = true; // Server is responding
        checks['Backend Service'].time = Date.now() - start1;
      }
    }

    // Test registration and auth
    const emailId = Date.now();
    const start2 = Date.now();
    const signup = await axios.post(`${API}/api/auth/register`, {
      firstName: 'Health',
      lastName: 'Check',
      email: `check${emailId}@test.com`,
      password: 'Check@12345',
      phone: '+9779800000000',
      gender: 'male'
    });
    const token = signup.data.token;
    checks['Authentication Service'].status = !!token;
    checks['Authentication Service'].time = Date.now() - start2;
    checks['Database Connection'].status = !!signup.data.user;
    checks['Database Connection'].time = Date.now() - start2;

    const headers = { Authorization: `Bearer ${token}` };

    // Check NLP endpoints
    const start3 = Date.now();
    try {
      await axios.post(`${API}/api/nlp/analyze`, { text: 'test' }, { headers });
      checks['NLP Endpoints'].status = true;
      checks['NLP Endpoints'].time = Date.now() - start3;
    } catch (e) {
      checks['NLP Endpoints'].status = false;
    }

    // Check Recommendations endpoints
    const start4 = Date.now();
    try {
      await axios.get(`${API}/api/recommendations/health-score`, { headers });
      checks['Recommendations Endpoints'].status = true;
      checks['Recommendations Endpoints'].time = Date.now() - start4;
    } catch (e) {
      checks['Recommendations Endpoints'].status = false;
    }

    // Measure API response time
    const start5 = Date.now();
    await axios.post(`${API}/api/nlp/chat`, { message: 'test' }, { headers });
    checks['API Response Time'].status = true;
    checks['API Response Time'].time = Date.now() - start5;

  } catch (error) {
    console.error('Health check error:', error.message);
  }

  // Print results
  let allHealthy = true;
  console.log('System Status:\n');
  Object.entries(checks).forEach(([name, data]) => {
    const status = data.status ? '✅ OK' : '❌ FAIL';
    const time = data.time ? `(${data.time}ms)` : '';
    console.log(`  ${status}  ${name} ${time}`);
    if (!data.status) allHealthy = false;
  });

  console.log('\n╔═══════════════════════════════════════════════════════╗');
  if (allHealthy) {
    console.log('║              🎉 System is HEALTHY                      ║');
  } else {
    console.log('║         ⚠️  Some systems need attention               ║');
  }
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  process.exit(0);
}

systemHealthCheck();
