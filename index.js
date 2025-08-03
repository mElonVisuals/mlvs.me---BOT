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

        const BOT_OWNER_ID = '952705075711729695';

    client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        // --- Permission & Owner Check ---
        
        // Check if the command is for the owner only.
        if (command.ownerOnly && interaction.user.id !== BOT_OWNER_ID) {
            const forbiddenEmbed = new EmbedBuilder()
                .setColor(0xFEE75C)
                .setTitle('Permission Denied')
                .setDescription('This command is only available to the bot owner.')
                .setTimestamp();
            return await interaction.reply({ embeds: [forbiddenEmbed], ephemeral: true });
        }

        // Check for role-based permissions.
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
        
        // If all checks pass, execute the command.
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        const errorEmbed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('An Error Occurred')
            .setDescription('There was an error while executing this command. Please try again later.')
            .setTimestamp();
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
        } else {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
});

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
