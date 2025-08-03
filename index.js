/**
 * mlvs.me Discord Bot
 * Main entry point for the bot application
 */

require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { loadCommands } = require('./src/utils/commandLoader');
const { loadEvents } = require('./src/utils/eventLoader');
const { initializeDatabase } = require('./src/utils/database');

// Validate required environment variables
if (!process.env.DISCORD_TOKEN) {
    console.error('❌ DISCORD_TOKEN is not set in .env file');
    process.exit(1);
}

if (!process.env.CLIENT_ID) {
    console.error('❌ CLIENT_ID is not set in .env file');
    process.exit(1);
}

// Validate required database environment variables
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
    console.error('❌ One or more required database variables (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME) are not set in .env file.');
    process.exit(1);
}

console.log('✅ Environment variables loaded successfully');

// Create a new client instance with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Create a collection to store commands
client.commands = new Collection();

// Initialize the bot
async function initializeBot() {
    try {
        console.log('🚀 Starting mlvs.me bot...');

        // Initialize the database connection
        await initializeDatabase();

        // Load commands and events
        await loadCommands(client);
        await loadEvents(client);

        console.log('🔐 Attempting to login to Discord...');

        // Login to Discord
        await client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
        console.error('❌ Failed to initialize bot:', error);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', error => {
    console.error('❌ Unhandled promise rejection:', error);
    console.error('Stack trace:', error.stack);
});

// Handle uncaught exceptions
process.on('uncaughtException', error => {
    console.error('❌ Uncaught exception:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
});

// Run the initialization function
initializeBot();
