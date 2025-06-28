const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');

console.log('Environment variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('NODE_ENV:', process.env.NODE_ENV);

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Successfully connected to MongoDB');
    
    // Test creating a simple document
    const testSchema = new mongoose.Schema({ name: String });
    const TestModel = mongoose.model('Test', testSchema);
    
    console.log('Creating test document...');
    const doc = new TestModel({ name: 'test' });
    await doc.save();
    console.log('Test document created');
    
    const count = await TestModel.countDocuments();
    console.log('Test document count:', count);
    
    await TestModel.deleteMany({});
    console.log('Test documents cleaned up');
    
    await mongoose.connection.close();
    console.log('Connection closed');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testConnection();
