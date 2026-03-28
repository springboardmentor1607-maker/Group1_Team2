const locationService = require('./backend/services/locationService');
require('dotenv').config({ path: './backend/.env' });

async function test() {
    console.log('Testing reverse geocoding for Warangal (approx)...');
    try {
        const result = await locationService.reverseGeocode(17.9689, 79.5941);
        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    }
}

test();
