/**
 * Main entry point for the Discord bot.
 * Initializes the Discord client, loads commands and events, and connects to the database.
 */

// Load environment variables from .env file
require('dotenv').config();

// Import necessary classes from the discord.js library
const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js');

// Import utility functions for loading commands and events, and for database connection
const { loadCommands } = require('./src/utils/commandLoader');
const { loadEvents } = require('./src/utils/eventLoader');
const { initDatabase } = require('./src/utils/database');

// Create a new Discord client instance with the required intents
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

        // Load commands and events from their respective directories
        await loadCommands(client);
        await loadEvents(client);

        // Initialize the database connection and check the "reminders" table
        await initDatabase();

        // Define the bot owner's ID for owner-only commands
        const BOT_OWNER_ID = '952705075711729695';

        // Event listener for slash command interactions
        client.on('interactionCreate', async interaction => {
            // Only process slash command interactions
            if (!interaction.isChatInputCommand()) return;

            // Get the command from the client's command collection
            const command = interaction.client.commands.get(interaction.commandName);

            // If the command doesn't exist, log an error and return
            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                // --- Permission & Owner Checks ---

                // Check if the command is for the owner only
                if (command.ownerOnly && interaction.user.id !== BOT_OWNER_ID) {
                    const forbiddenEmbed = new EmbedBuilder()
                        .setColor(0xFEE75C)
                        .setTitle('Permission Denied')
                        .setDescription('This command is only available to the bot owner.')
                        .setTimestamp();
                    return await interaction.reply({ embeds: [forbiddenEmbed], ephemeral: true });
                }

                // Check for role-based permissions if defined in the command file
                if (command.permissions && command.permissions.length > 0) {
                    const memberRoles = interaction.member.roles.cache;
                    const hasPermission = command.permissions.some(roleId => memberRoles.has(roleId));

                    if (!hasPermission) {
                        const forbiddenEmbed = new EmbedBuilder()
                            .setColor(0xFEE75C)
                            .setTitle('Permission Denied')
                            .setDescription('You do not have the required role to use this command.')
                            .setTimestamp();
                        return await interaction.reply({ embeds: [forbiddenEmbed], ephemeral: true });
                    }
                }

                // If all checks pass, execute the command
                await command.execute(interaction);
            } catch (error) {
                // Log the error to the console for debugging
                console.error(error);

                // Create a user-friendly error message using an embed
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xED4245)
                    .setTitle('An Error Occurred')
                    .setDescription('There was an error while executing this command. Please try again later.')
                    .setTimestamp();

                // Check if the interaction has already been replied to or deferred
                if (interaction.replied || interaction.deferred) {
                    // Use followUp if a reply has already been sent or deferred
                    await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    // Otherwise, send a new reply
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }
            }
        });

        // Log in to Discord using the bot token from environment variables
        await client.login(process.env.DISCORD_TOKEN);
        console.log('✨ Bot logged in successfully!');

    } catch (error) {
        console.error('❌ Failed to initialize bot:', error);
        console.error('Stack trace:', error); // Log the full stack trace for better debugging
        process.exit(1); // Exit the process if initialization fails
    }
}

// Call the initialization function to start the bot
initializeBot();

// Handle unhandled promise rejections to prevent the bot from crashing
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// Handle graceful shutdown signals to ensure a clean exit
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
