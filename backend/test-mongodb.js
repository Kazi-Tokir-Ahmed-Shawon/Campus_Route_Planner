const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-db';

async function testConnection() {
  try {
    if (MONGODB_URI === 'mongodb://localhost:27017/campus-db') {
      console.log('⚠️  MongoDB URI not configured. Please set MONGODB_URI in your .env file');
      console.log('📝 Example: MONGODB_URI=mongodb://localhost:27017/campus-db');
      return;
    }

    console.log('🔌 Testing MongoDB connection...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully!');
    
    // Test database operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📚 Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error.message);
  }
}

testConnection();
