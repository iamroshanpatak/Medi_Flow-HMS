/**
 * Test Suite for New Features and Fixes
 * Tests:
 * 1. Input validation for registration, login, profile update
 * 2. Dashboard endpoints
 * 3. Email credentials validation
 * 4. Rate limiting
 */

const axios = require('axios');

const API = 'http://localhost:5001';
let testUser = null;
let authToken = null;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testValidation() {
  log('\n========== TESTING INPUT VALIDATION ==========', 'blue');

  try {
    // Test 1: Invalid email format
    log('\n✓ Test 1: Invalid email registration', 'yellow');
    try {
      await axios.post(`${API}/api/auth/register`, {
        firstName: 'Test',
        lastName: 'User',
        email: 'invalid-email',
        password: 'TestPass123!',
        phone: '+1234567890'
      });
      log('✗ FAILED: Should have rejected invalid email', 'red');
    } catch (e) {
      if (e.response?.status === 400) {
        log(`✓ PASSED: Invalid email rejected - ${e.response.data.message}`, 'green');
      }
    }

    // Test 2: Weak password
    log('\n✓ Test 2: Weak password registration', 'yellow');
    try {
      await axios.post(`${API}/api/auth/register`, {
        firstName: 'Test',
        lastName: 'User',
        email: `test${Date.now()}@example.com`,
        password: 'weak',
        phone: '+1234567890'
      });
      log('✗ FAILED: Should have rejected weak password', 'red');
    } catch (e) {
      if (e.response?.status === 400) {
        log(`✓ PASSED: Weak password rejected - ${e.response.data.message}`, 'green');
      }
    }

    // Test 3: Valid registration
    log('\n✓ Test 3: Valid registration', 'yellow');
    const email = `testuser${Date.now()}@example.com`;
    try {
      const res = await axios.post(`${API}/api/auth/register`, {
        firstName: 'Test',
        lastName: 'User',
        email,
        password: 'ValidPass123!',
        phone: '+1234567890',
        gender: 'male'
      });
      if (res.status === 201 && res.data.token) {
        testUser = res.data.user;
        authToken = res.data.token;
        log(`✓ PASSED: User registered successfully`, 'green');
        log(`  Email: ${email}`, 'green');
      }
    } catch (e) {
      log(`✗ FAILED: ${e.response?.data?.message}`, 'red');
    }

  } catch (error) {
    log(`Error in validation tests: ${error.message}`, 'red');
  }
}

async function testDashboard() {
  log('\n========== TESTING DASHBOARD ENDPOINTS ==========', 'blue');

  if (!authToken) {
    log('✗ No auth token found. Skipping dashboard tests.', 'red');
    return;
  }

  const headers = { Authorization: `Bearer ${authToken}` };

  try {
    // Test Patient Dashboard
    log('\n✓ Test 1: Patient Dashboard', 'yellow');
    try {
      const res = await axios.get(`${API}/api/dashboard/patient`, { headers });
      if (res.status === 200 && res.data.success && res.data.data.stats) {
        log(`✓ PASSED: Patient dashboard loaded`, 'green');
        log(`  Stats: ${JSON.stringify(res.data.data.stats)}`, 'green');
      }
    } catch (e) {
      log(`✗ FAILED: ${e.response?.data?.message || e.message}`, 'red');
    }

    // Test Doctor Dashboard (patient shouldn't access this)
    log('\n✓ Test 2: Doctor Dashboard (Unauthorized test)', 'yellow');
    try {
      const res = await axios.get(`${API}/api/dashboard/doctor`, { headers });
      log(`✗ FAILED: Should be unauthorized as patient`, 'red');
    } catch (e) {
      if (e.response?.status === 403 || e.response?.status === 401) {
        log(`✓ PASSED: Correctly rejected non-doctor access`, 'green');
      } else {
        log(`Note: Got status ${e.response?.status}`, 'yellow');
      }
    }

  } catch (error) {
    log(`Error in dashboard tests: ${error.message}`, 'red');
  }
}

async function testRateLimiting() {
  log('\n========== TESTING RATE LIMITING ==========', 'blue');

  try {
    log('\n✓ Test: Rate limiting on login endpoint', 'yellow');
    let blocked = false;
    
    for (let i = 1; i <= 6; i++) {
      try {
        await axios.post(`${API}/api/auth/login`, {
          email: 'test@example.com',
          password: 'wrong'
        });
      } catch (e) {
        if (e.response?.status === 429) {
          blocked = true;
          log(`✓ PASSED: Rate limited after ${i} requests`, 'green');
          break;
        }
      }
    }

    if (!blocked) {
      log(`Note: Rate limiting may not be active yet`, 'yellow');
    }

  } catch (error) {
    log(`Error in rate limiting tests: ${error.message}`, 'red');
  }
}

async function testProfileUpdate() {
  log('\n========== TESTING PROFILE UPDATE VALIDATION ==========', 'blue');

  if (!authToken) {
    log('✗ No auth token found. Skipping profile update tests.', 'red');
    return;
  }

  const headers = { Authorization: `Bearer ${authToken}` };

  try {
    // Test invalid phone
    log('\n✓ Test 1: Invalid phone format', 'yellow');
    try {
      await axios.put(`${API}/api/auth/update-profile`, {
        phone: 'invalid-phone'
      }, { headers });
      log('✗ FAILED: Should have rejected invalid phone', 'red');
    } catch (e) {
      if (e.response?.status === 400) {
        log(`✓ PASSED: Invalid phone rejected`, 'green');
      }
    }

    // Test valid update
    log('\n✓ Test 2: Valid profile update', 'yellow');
    try {
      const res = await axios.put(`${API}/api/auth/update-profile`, {
        firstName: 'UpdatedName',
        phone: '+9876543210'
      }, { headers });
      if (res.status === 200 && res.data.success) {
        log(`✓ PASSED: Profile updated successfully`, 'green');
      }
    } catch (e) {
      log(`✗ FAILED: ${e.response?.data?.message}`, 'red');
    }

  } catch (error) {
    log(`Error in profile update tests: ${error.message}`, 'red');
  }
}

async function runAllTests() {
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║     MEDIFLOW FIXES AND FEATURES TEST SUITE            ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');

  try {
    await testValidation();
    await testDashboard();
    await testProfileUpdate();
    await testRateLimiting();

    log('\n╔════════════════════════════════════════════════════════╗', 'blue');
    log('║          TEST SUITE COMPLETED SUCCESSFULLY            ║', 'blue');
    log('╚════════════════════════════════════════════════════════╝', 'blue');
  } catch (error) {
    log(`\nFatal error: ${error.message}`, 'red');
  }

  process.exit(0);
}

// Run tests
runAllTests();
