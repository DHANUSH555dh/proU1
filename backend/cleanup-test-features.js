require('dotenv').config();
const mongoose = require('mongoose');
const RoomFeature = require('./models/RoomFeature');

async function removeTestFeatures() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel-booking');
        console.log('✅ Connected to MongoDB');
        
        // Remove test features
        const result = await RoomFeature.deleteMany({
            name: { $regex: /test/i }
        });
        
        console.log(`✅ Removed ${result.deletedCount} test features from database`);
        
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        console.log('✨ Cleanup completed successfully!');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
    process.exit(0);
}

removeTestFeatures();