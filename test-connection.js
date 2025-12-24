// Test MongoDB Atlas Connection
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const mongoose = require('mongoose');

async function testConnection() {
    try {
        const mongoURI = process.env.MONGODB_URI;
        
        console.log('🧪 Testing MongoDB Connection...\n');
        console.log('Environment Variables:');
        console.log(`   MONGODB_URI exists: ${mongoURI ? 'Yes ✅' : 'No ❌'}`);
        
        if (!mongoURI) {
            console.error('\n❌ MONGODB_URI not found!');
            console.error('Please check your .env file');
            process.exit(1);
        }
        
        console.log(`   Connection String: ${mongoURI.replace(/:[^:@]+@/, ':****@')}`);
        console.log(`   Is Atlas: ${mongoURI.includes('mongodb+srv://') ? 'Yes ✅' : 'No ❌'}`);
        console.log(`   Is Localhost: ${mongoURI.includes('localhost') || mongoURI.includes('127.0.0.1') ? 'Yes ⚠️' : 'No ✅'}\n`);
        
        console.log('🔄 Connecting...\n');
        
        const conn = await mongoose.connect(mongoURI);
        
        const isAtlas = conn.connection.host.includes('mongodb.net') || 
                       conn.connection.host.includes('atlas') ||
                       conn.connection.host.includes('cluster');
        
        console.log('✅ Connection Successful!\n');
        console.log('Connection Details:');
        console.log(`   Host: ${conn.connection.host}`);
        console.log(`   Database: ${conn.connection.name}`);
        console.log(`   Connection Type: ${isAtlas ? 'MongoDB Atlas (Cloud) ✅' : 'Local MongoDB ⚠️'}`);
        console.log(`   Ready State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}\n`);
        
        if (!isAtlas) {
            console.warn('⚠️  WARNING: You are connected to LOCAL MongoDB, not MongoDB Atlas!');
            console.warn('⚠️  Your data will be stored locally, not in the cloud.\n');
        } else {
            console.log('✅ Successfully connected to MongoDB Atlas!\n');
        }
        
        // Test creating a document
        const TestModel = mongoose.model('Test', new mongoose.Schema({ name: String, timestamp: Date }));
        const testDoc = new TestModel({ name: 'Connection Test', timestamp: new Date() });
        await testDoc.save();
        console.log('✅ Test document created successfully!');
        console.log(`   Document ID: ${testDoc._id}`);
        
        // Clean up test document
        await TestModel.deleteOne({ _id: testDoc._id });
        console.log('✅ Test document deleted (cleanup)\n');
        
        await mongoose.connection.close();
        console.log('✅ Connection closed. Test complete!');
        
    } catch (error) {
        console.error('\n❌ Connection Failed!');
        console.error(`Error: ${error.message}\n`);
        console.error('Troubleshooting:');
        console.error('1. Check your .env file has the correct MONGODB_URI');
        console.error('2. Verify your IP is whitelisted in MongoDB Atlas');
        console.error('3. Check your username and password are correct');
        console.error('4. Ensure your internet connection is working');
        process.exit(1);
    }
}

testConnection();

