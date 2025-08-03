/**
 * This is the final, updated index.js file for a single-server bot.
 * It removes all command deployment logic, which is now handled by deploy-commands.js.
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

        // --- INTERACTION HANDLER ---
        client.on('interactionCreate', async interaction => {
            if (!interaction.isChatInputCommand()) return;

            // Get the command from the client's command collection
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            console.log(`[INFO] Executing command: ${interaction.commandName} by user: ${interaction.user.username}`);

            try {
                // Pre-execution permission checks
                if (command.ownerOnly && interaction.user.id !== BOT_OWNER_ID) {
                    const forbiddenEmbed = new EmbedBuilder()
                        .setColor(0xFEE75C)
                        .setTitle('Permission Denied')
                        .setDescription('This command is only available to the bot owner.')
                        .setTimestamp();
                    return await interaction.reply({ embeds: [forbiddenEmbed], flags: MessageFlags.Ephemeral });
                }

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

                await interaction.deferReply({ ephemeral: true });
                await command.execute(interaction);

            } catch (error) {
                console.error(`[ERROR] An error occurred while executing command ${interaction.commandName}:`, error);

                if (interaction.deferred) {
                    await interaction.editReply({
                        content: 'There was an error while executing this command!',
                        ephemeral: true
                    }).catch(err => console.error('Failed to send error follow-up:', err));
                } else {
                    await interaction.reply({
                        content: 'There was an error while executing this command!',
                        ephemeral: true
                    }).catch(err => console.error('Failed to send error reply:', err));
                }
            }
        });

        // Log in to Discord using the bot token from environment variables
        await client.login(process.env.DISCORD_TOKEN);
        console.log('✨ Bot logged in successfully!');

    } catch (error) {
        console.error('❌ Failed to initialize bot:', error);
        console.error('Stack trace:', error);
        process.exit(1);
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
