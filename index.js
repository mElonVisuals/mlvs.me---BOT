/**
 * Main entry point for the Discord bot.
 * Initializes the Discord client, loads commands and events, and connects to the database.
 */

require('dotenv').config(); // Load environment variables
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { loadCommands } = require('./src/utils/commandLoader');
const { loadEvents } = require('./src/utils/eventLoader');
const { initDatabase } = require('./src/utils/database'); // Import the correct function

// Create a new Discord client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers, // For welcome/goodbye messages
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // Required for message content (e.g., AFK)
    ],
});

// Create a collection to store commands
client.commands = new Collection();

async function initializeBot() {
    try {
        console.log('✅ Environment variables loaded successfully');
        console.log('🚀 Starting mlvs.me bot...');

        // Load commands and events
        await loadCommands(client);
        await loadEvents(client);

        // Initialize the database connection and table (this is the fix!)
        await initDatabase(); // Correct function name

        // Log in to Discord
        await client.login(process.env.DISCORD_TOKEN);
        console.log('✨ Bot logged in successfully!');

    } catch (error) {
        console.error('❌ Failed to initialize bot:', error);
        console.error('Stack trace:', error); // Log the full stack trace for better debugging
        process.exit(1); // Exit the process if initialization fails
    }
}

// Call the initialization function
initializeBot();

// Handle graceful shutdown
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
