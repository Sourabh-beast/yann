const axios = require('axios');
const { performance } = require('perf_hooks');

const BASE_URL = 'http://localhost:3000/api';
// You might need a valid token for bookings. 
// For now we test public endpoints primarily.
// If you have a token, put it here:
const TOKEN = '';

async function measure(name, url, token = null) {
    const start = performance.now();
    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        await axios.get(url, { headers });
        const end = performance.now();
        console.log(`✅ ${name}: ${(end - start).toFixed(2)}ms`);
        return end - start;
    } catch (error) {
        console.error(`❌ ${name} failed:`, error.message);
        return null;
    }
}

async function run() {
    console.log('🚀 Starting Performance Test...');

    // Warmup (optional)
    // await measure('Warmup', `${BASE_URL}/services`);

    await measure('Services (GET /api/services)', `${BASE_URL}/services`);
    await measure('Service Counts (GET /api/provider/service-counts)', `${BASE_URL}/provider/service-counts`);

    // Create a dummy token if possible or skip auth routes for now if difficult to automate
    // await measure('Bookings (GET /api/bookings)', `${BASE_URL}/bookings`, TOKEN);
}

run();
