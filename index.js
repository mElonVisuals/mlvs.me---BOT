/**
 * mlvs.me Discord Bot
 * Main entry point for the bot application
 */

require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { loadCommands } = require('./src/utils/commandLoader');
const { loadEvents } = require('./src/utils/eventLoader');

// Validate required environment variables
if (!process.env.DISCORD_TOKEN) {
    console.error('❌ DISCORD_TOKEN is not set in .env file');
    process.exit(1);
}

if (!process.env.CLIENT_ID) {
    console.error('❌ CLIENT_ID is not set in .env file');
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

// Start the bot
console.log('🔄 Initializing bot...');
initializeBot();