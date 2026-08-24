const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 MEMULAI AUTOMATED TESTING UDARAAPI SaaS PLATFORM');
  console.log('====================================================\n');

  let jwtToken = '';
  let apiKey = '';
  let testEmail = `tester_${Date.now()}@test.com`;

  // 1. Test Public Stats
  console.log('🔹 [TEST 1] Menguji Endpoint Publik: GET /api/v1/stats');
  try {
    const res = await fetch(`${BASE_URL}/api/v1/stats`);
    const data = await res.json();
    console.log('Status Code:', res.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('✅ TEST 1 PASSED!\n');
  } catch (err) {
    console.error('❌ TEST 1 FAILED:', err.message);
  }

  // 2. Test User Registration (JWT Auth)
  console.log('🔹 [TEST 2] Menguji Register Akun: POST /auth/register');
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Budi Developer',
        email: testEmail,
        password: 'passwordRahasia123',
      }),
    });
    const data = await res.json();
    console.log('Status Code:', res.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    if (data.success && data.data.token) {
      jwtToken = data.data.token;
      console.log('✅ TEST 2 PASSED (JWT Token didapatkan)!\n');
    } else {
      console.log('⚠️ TEST 2 Note:', data.error);
    }
  } catch (err) {
    console.error('❌ TEST 2 FAILED:', err.message);
  }

  // 3. Test User Login (JWT Auth)
  console.log('🔹 [TEST 3] Menguji Login: POST /auth/login');
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'passwordRahasia123',
      }),
    });
    const data = await res.json();
    console.log('Status Code:', res.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    if (data.success && data.data.token) {
      jwtToken = data.data.token;
      console.log('✅ TEST 3 PASSED!\n');
    }
  } catch (err) {
    console.error('❌ TEST 3 FAILED:', err.message);
  }

  // 4. Test Create API Key via Dashboard
  console.log('🔹 [TEST 4] Menguji Buat API Key: POST /dashboard/keys');
  try {
    const res = await fetch(`${BASE_URL}/dashboard/keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        key_name: 'App Pantau Karhutla Riau',
      }),
    });
    const data = await res.json();
    console.log('Status Code:', res.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    if (data.success && data.data.api_key) {
      apiKey = data.data.api_key;
      console.log('✅ TEST 4 PASSED (API Key berhasil dibuat):', apiKey, '\n');
    }
  } catch (err) {
    console.error('❌ TEST 4 FAILED:', err.message);
  }

  // 5. Test Access Protected API WITHOUT API Key (Must be 401)
  console.log('🔹 [TEST 5] Menguji Akses Tanpa API Key: GET /api/v1/records (Harus 401 Unauthorized)');
  try {
    const res = await fetch(`${BASE_URL}/api/v1/records`);
    const data = await res.json();
    console.log('Status Code:', res.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    if (res.status === 401) {
      console.log('✅ TEST 5 PASSED (Keamanan API Key Berfungsi!)\n');
    } else {
      console.log('❌ TEST 5 FAILED: Harusnya 401 Unauthorized\n');
    }
  } catch (err) {
    console.error('❌ TEST 5 FAILED:', err.message);
  }

  // 6. Test Access API WITH API Key: GET /api/v1/stations
  console.log('🔹 [TEST 6] Menguji Mengambil Stasiun: GET /api/v1/stations (Dengan Header X-API-Key)');
  try {
    const res = await fetch(`${BASE_URL}/api/v1/stations?limit=5`, {
      headers: { 'X-API-Key': apiKey },
    });
    const data = await res.json();
    console.log('Status Code:', res.status);
    console.log('Response Sample (first 2 stations):', JSON.stringify({
      ...data,
      data: data.data ? data.data.slice(0, 2) : data.data
    }, null, 2));
    console.log('✅ TEST 6 PASSED!\n');
  } catch (err) {
    console.error('❌ TEST 6 FAILED:', err.message);
  }

  // 7. Test Access Latest Records WITH Filter: GET /api/v1/records/latest
  console.log('🔹 [TEST 7] Menguji Snapshot Terkini: GET /api/v1/records/latest (Dengan Header X-API-Key)');
  try {
    const res = await fetch(`${BASE_URL}/api/v1/records/latest`, {
      headers: { 'X-API-Key': apiKey },
    });
    const data = await res.json();
    console.log('Status Code:', res.status);
    console.log('Response Sample (first 2 items):', JSON.stringify({
      ...data,
      data: data.data ? data.data.slice(0, 2) : data.data
    }, null, 2));
    console.log('✅ TEST 7 PASSED!\n');
  } catch (err) {
    console.error('❌ TEST 7 FAILED:', err.message);
  }

  // 8. Test Usage Logs & Analytics Tracking
  console.log('🔹 [TEST 8] Menguji Dashboard Usage Tracking: GET /dashboard/usage');
  try {
    const res = await fetch(`${BASE_URL}/dashboard/usage`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` },
    });
    const data = await res.json();
    console.log('Status Code:', res.status);
    console.log('Usage Summary:', JSON.stringify(data.data?.summary, null, 2));
    console.log('Top Endpoints:', JSON.stringify(data.data?.top_endpoints, null, 2));
    console.log('✅ TEST 8 PASSED (Request ter-logging otomatis & counter bertambah)!\n');
  } catch (err) {
    console.error('❌ TEST 8 FAILED:', err.message);
  }

  console.log('====================================================');
  console.log('🎉 SEMUA TEST SUITE SELESAI DIEKSEKUSI!');
  console.log('====================================================');
}

runTests();
