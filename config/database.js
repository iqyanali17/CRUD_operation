const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Force load .env again to ensure it's loaded
        require('dotenv').config();
        
        const mongoURI = process.env.MONGODB_URI;
        
        if (!mongoURI) {
            console.error('❌ MONGODB_URI not found in environment variables!');
            console.error('Please check your .env file exists and has MONGODB_URI set');
            process.exit(1);
        }
        
        // Verify it's Atlas connection (not localhost)
        if (mongoURI.includes('localhost') || mongoURI.includes('127.0.0.1')) {
            console.error('❌ WARNING: Connection string points to localhost, not MongoDB Atlas!');
            console.error('Please update your .env file with MongoDB Atlas connection string');
            process.exit(1);
        }
        
        console.log('🔄 Connecting to MongoDB Atlas...');
        console.log(`📍 Connection String: ${mongoURI.replace(/:[^:@]+@/, ':****@')}`); // Hide password in logs
        console.log(`📍 Is Atlas: ${mongoURI.includes('mongodb+srv://') ? 'Yes ✅' : 'No ❌'}`);
        
        const conn = await mongoose.connect(mongoURI, {
            // MongoDB Atlas connection options
        });
        
        // Verify we're connected to Atlas (not localhost)
        const isAtlas = conn.connection.host.includes('mongodb.net') || 
                       conn.connection.host.includes('atlas') ||
                       conn.connection.host.includes('cluster');
        
        console.log(`✅ MongoDB ${isAtlas ? 'Atlas' : 'Local'} Connected Successfully!`);
        console.log(`   Host: ${conn.connection.host}`);
        console.log(`   Database: ${conn.connection.name}`);
        console.log(`   Connection Type: ${isAtlas ? 'MongoDB Atlas (Cloud) ✅' : 'Local MongoDB ⚠️'}`);
        console.log(`   Ready State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
        
        if (!isAtlas) {
            console.warn('⚠️  WARNING: Connected to local MongoDB, not MongoDB Atlas!');
            console.warn('⚠️  Check your .env file MONGODB_URI setting');
        }
        
        console.log('─────────────────────────────────────');
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        console.error('Please check:');
        console.error('   1. Your MongoDB Atlas connection string in .env file');
        console.error('   2. Your IP address is whitelisted in MongoDB Atlas');
        console.error('   3. Your database user has read/write permissions');
        console.error('   4. Your internet connection is working');
        process.exit(1);
    }
};

module.exports = connectDB;

