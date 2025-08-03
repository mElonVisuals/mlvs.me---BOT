/**
 * This is the main entry point for the bot.
 * It handles the initialization of the Discord client, loads commands and events,
 * and logs the bot in using the token from the .env file.
 */

// Load environment variables from .env file
require('dotenv').config();

// Import necessary classes from the discord.js library
const { Client, Collection, GatewayIntentBits } = require('discord.js');

// Import utility functions for loading commands and events, and for database connection
const { loadCommands } = require('./src/utils/commandLoader');
const { loadEvents } = require('./src/utils/eventLoader');
const { initDatabase } = require('./src/utils/database');

// Create a new Discord client instance with the required intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers, // For member-related events (e.g., welcome messages)
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // Required for message content and certain message-based commands
    ],
});

// Create a collection to store commands and make it accessible from the client object
client.commands = new Collection();

/**
 * Initializes the bot by loading all commands, events, and connecting to the database.
 */
async function initializeBot() {
    try {
        console.log('✅ Environment variables loaded successfully');
        console.log('🚀 Starting mlvs.me bot...');

        // Load commands from the 'src/commands' directory
        await loadCommands(client);

        // Load events from the 'src/events' directory. The interactionCreate event
        // handler will now be in its own file.
        await loadEvents(client);

        // Initialize the database connection
        await initDatabase();

        // Log in to Discord using the bot token from environment variables
        await client.login(process.env.DISCORD_TOKEN);
        console.log('✨ Bot logged in successfully!');

    } catch (error) {
        console.error('❌ Failed to initialize bot:', error);
        console.error('Stack trace:', error);
        process.exit(1);
    }
}

// Start the bot
initializeBot();

// Global error handlers to prevent the bot from crashing on unhandled errors.
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully.');
    client.destroy();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully.');
    client.destroy();
    process.exit(0);
});
