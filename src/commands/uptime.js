/**
 * This is the uptime.js command file.
 * It's designed to work with a Discord bot using discord.js v14 and slash commands.
 * This command displays how long the bot has been online in a human-readable format.
 */

// Import the necessary SlashCommandBuilder class from discord.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Helper function to format the uptime string
const formatUptime = (ms) => {
    // Calculate uptime in days, hours, minutes, and seconds
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    // Use an array to build the formatted string parts
    const parts = [];

    if (days > 0) {
        parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    }
    if (hours > 0) {
        parts.push(`${hours % 24} hour${hours % 24 !== 1 ? 's' : ''}`);
    }
    if (minutes > 0) {
        parts.push(`${minutes % 60} minute${minutes % 60 !== 1 ? 's' : ''}`);
    }
    if (seconds > 0) {
        parts.push(`${seconds % 60} second${seconds % 60 !== 1 ? 's' : ''}`);
    }

    // Handle case where uptime is less than a second
    if (parts.length === 0) {
        return 'Less than a second';
    }

    // Join the parts with commas and "and" at the end
    if (parts.length > 1) {
        const lastPart = parts.pop();
        return `${parts.join(', ')} and ${lastPart}`;
    }

    return parts[0];
};

module.exports = {
    // The data property provides the command's information for Discord.
    // It's a required property for all commands.
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Shows how long the bot has been online.'),

    // The execute property contains the code that runs when the command is called.
    async execute(interaction) {
        // Defer the reply to ensure a quick response time, especially if the command logic takes a moment.
        // The `ephemeral: true` flag means the response is only visible to the user who ran the command.
        await interaction.deferReply({ ephemeral: true });

        // Get the bot's uptime in milliseconds from the client object
        const uptimeInMs = interaction.client.uptime;

        // Use the helper function to get a formatted string
        const formattedUptime = formatUptime(uptimeInMs);

        // Create a new embed to display the uptime information cleanly
        const uptimeEmbed = new EmbedBuilder()
            .setColor(0x0099ff) // A clean blue color
            .setTitle('Bot Uptime ⏱️')
            .setDescription(`I've been online for **${formattedUptime}**.`)
            .setTimestamp() // Adds a timestamp to the embed
            .setFooter({ text: 'Bot Information' }); // A small footer

        // Edit the deferred reply to show the uptime embed
        await interaction.editReply({ embeds: [uptimeEmbed] });
    },
};
