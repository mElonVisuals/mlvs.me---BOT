/**
 * Database Connection Utility
 * Connects to a MongoDB database using the official driver.
 */

const { MongoClient, ServerApiVersion } = require('mongodb');

// Store the client connection in a global variable for reuse
let client;

/**
 * Establishes a connection to the MongoDB database.
 * @async
 * @returns {Promise<void>}
 */
async function connectToDatabase() {
    // Check if a client is already connected
    if (client && client.db) {
        console.log('✅ Already connected to the database.');
        return;
    }

    const uri = process.env.MONGO_URL;

    // Create a MongoClient with a MongoClientOptions object to set the Stable API version
    try {
        client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });

        // Connect the client to the server
        await client.connect();
        // Log a success message on successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("✅ Successfully connected to MongoDB!");

    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        // Rethrow the error to be caught by the main `initializeBot` function
        throw error;
    }
}

/**
 * Gets the database instance.
 * @returns {object|null} The database instance or null if not connected.
 */
function getDatabase() {
    if (!client) {
        return null;
    }
    return client.db(); // You can specify a database name here, e.g., client.db("my-database")
}

module.exports = {
    connectToDatabase,
    getDatabase,
    client,
};
