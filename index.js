/**
 * COMPLETE FIXED INDEX.JS
 * Replace your entire index.js file with this version
 */

// Load environment variables from .env file
require('dotenv').config();

// Import necessary classes from the discord.js library
const { Client, Collection, GatewayIntentBits, EmbedBuilder, MessageFlags } = require('discord.js');

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

        // --- NEW AND IMPROVED INTERACTION HANDLER ---
        // This handler now correctly defers replies to prevent timeouts and handles errors more gracefully.
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

            console.log(`[INFO] Executing command: ${interaction.commandName} by user: ${interaction.user.username}`);

            try {
                // --- PRE-EXECUTION PERMISSION CHECKS ---
                // These checks happen BEFORE we defer. This is more efficient.

                // Check if the command is for the owner only
                if (command.ownerOnly && interaction.user.id !== BOT_OWNER_ID) {
                    const forbiddenEmbed = new EmbedBuilder()
                        .setColor(0xFEE75C)
                        .setTitle('Permission Denied')
                        .setDescription('This command is only available to the bot owner.')
                        .setTimestamp();
                    return await interaction.reply({ embeds: [forbiddenEmbed], flags: MessageFlags.Ephemeral });
                }

                // Check for role-based permissions
                if (command.permissions && command.permissions.length > 0) {
                    const memberRoles = interaction.member?.roles?.cache;
                    if (!memberRoles || !command.permissions.some(roleId => memberRoles.has(roleId))) {
                        const forbiddenEmbed = new EmbedBuilder()
                            .setColor(0xFEE75C)
                            .setTitle('Permission Denied')
                            .setDescription('You do not have the required role to use this command.')
                            .setTimestamp();
                        return await interaction.reply({ embeds: [forbiddenEmbed], flags: MessageFlags.Ephemeral });
                    }
                }

                // 🚨 CRITICAL FIX: Defer the reply right here.
                // This sends a "thinking..." message and buys the bot more time.
                // The `ephemeral` flag makes the thinking message only visible to the user.
                await interaction.deferReply({ ephemeral: true });

                // If all checks pass, execute the command
                // The command file will now use interaction.editReply() to send the final message.
                await command.execute(interaction);

            } catch (error) {
                console.error(`[ERROR] An error occurred while executing command ${interaction.commandName}:`, error);

                // This check handles cases where a command failed BEFORE or AFTER it was deferred.
                if (interaction.deferred) {
                    // If the reply was deferred, we need to edit the deferred message.
                    await interaction.editReply({
                        content: 'There was an error while executing this command!',
                        ephemeral: true
                    }).catch(err => console.error('Failed to send error follow-up:', err));
                } else {
                    // If the reply was not deferred (e.g., an error happened during permission checks),
                    // we can still send a regular reply.
                    await interaction.reply({
                        content: 'There was an error while executing this command!',
                        ephemeral: true
                    }).catch(err => console.error('Failed to send error reply:', err));
                }
            }
        });
        // --- END OF NEW INTERACTION HANDLER ---

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
