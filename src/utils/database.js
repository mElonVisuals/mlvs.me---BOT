/**
 * Database Connection Utility
 * Connects to a MongoDB database using the connection string from the .env file.
 */

// Import the MongoClient from the mongodb library
const { MongoClient } = require('mongodb');

// Get the MONGO_URL from the environment variables
const { MONGO_URL } = process.env;

// Create a new MongoClient
const client = new MongoClient(MONGO_URL);

/**
 * Connects to the MongoDB database.
 * @returns {Promise<MongoClient>} The connected MongoClient instance.
 */
async function connectToDatabase() {
    try {
        // Attempt to connect to the database
        console.log('🔗 Attempting to connect to MongoDB...');
        await client.connect();
        console.log('✅ Successfully connected to MongoDB!');
        return client;
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        // Rethrow the error to stop the bot from starting if the connection fails
        throw error;
    }
}

// Export the client and the connection function
module.exports = {
    client,
    connectToDatabase,
};
