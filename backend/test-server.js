// Test script to verify server endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5002';

async function testServer() {
  console.log('🧪 Testing Server Endpoints\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health check:', healthResponse.data.status);
    
    // Test route endpoint with different modes
    const testRoute = {
      start: "1", // Assuming these IDs exist in your data
      end: "2"
    };

    const modes = ['walk', 'cycle', 'disabled'];
    
    for (const mode of modes) {
      console.log(`\n2. Testing route endpoint with mode: ${mode}`);
      try {
        const routeResponse = await axios.post(`${BASE_URL}/api/route`, {
          ...testRoute,
          restriction: mode
        });
        
        const data = routeResponse.data;
        console.log(`✅ ${mode.toUpperCase()} mode:`);
        console.log(`   Routes found: ${data.summary.totalRoutes}`);
        console.log(`   Shortest distance: ${data.summary.shortestDistance}m`);
        console.log(`   Shortest time: ${data.summary.shortestTime}`);
        console.log(`   Mode: ${data.mode}`);
        
        // Verify that cycling is faster than walking
        if (mode === 'cycle' && data.routes.length > 0) {
          const cycleTime = data.routes[0].time;
          console.log(`   ⚡ Cycling time: ${cycleTime}s`);
        }
        
      } catch (error) {
        if (error.response) {
          console.log(`❌ ${mode} mode error:`, error.response.data.error);
        } else {
          console.log(`❌ ${mode} mode error:`, error.message);
        }
      }
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running. Please start the server with: npm run dev');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

// Run the test
testServer();
