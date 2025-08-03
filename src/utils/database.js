{javascript}
/**
 * Database Connection Utility
 * Handles connecting to MongoDB using Mongoose.
 */

const mongoose = require('mongoose');

// The main function to establish the database connection
async function connectDatabase() {
    // Check if the MONGO_URL environment variable is set
    if (!process.env.MONGO_URL) {
        console.error('❌ MONGO_URL is not set in the .env file. Database connection aborted.');
        // Don't exit the process so the bot can still run without a database
        return;
    }

    try {
        console.log('🔗 Attempting to connect to the database...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL, {
            // These options are recommended by Mongoose to ensure a stable connection
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s
        });

        console.log('✅ Successfully connected to the database!');

        // Optional: Log connection events
        mongoose.connection.on('error', err => {
            console.error('⚠️  Mongoose connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⛔ Mongoose has disconnected from the database.');
        });

    } catch (error) {
        console.error('❌ Failed to connect to the database:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Function to get the current connection status
function getConnectionStatus() {
    return mongoose.connection.readyState;
}

// Export the functions for use in other files
module.exports = { connectDatabase, getConnectionStatus };