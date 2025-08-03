/**
 * This is the ping.js command file.
 * It's designed to work with a Discord bot using discord.js v14 and slash commands.
 * This command replies with the bot's latency and the API latency.
 */

// Import the necessary SlashCommandBuilder and EmbedBuilder classes from discord.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    // The data property provides the command's information for Discord.
    // It's a required property for all commands.
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong! and shows the bot\'s latency.'),

    // The execute property contains the code that runs when the command is called.
    async execute(interaction) {
        // Defer the reply to ensure a quick response time,
        // which allows us to accurately measure the roundtrip latency.
        // We'll use a public reply for this command.
        const sent = await interaction.deferReply({ fetchReply: true });

        // Calculate the bot's latency (roundtrip)
        const botLatency = sent.createdTimestamp - interaction.createdTimestamp;

        // Get the API latency directly from the client's WebSocket ping
        const apiLatency = interaction.client.ws.ping;

        // Create a new embed to display the ping information cleanly
        const pingEmbed = new EmbedBuilder()
            .setColor(0x0099ff) // A clean blue color
            .setTitle('Pong! 🏓')
            .addFields(
                { name: 'Bot Latency', value: `${botLatency}ms`, inline: true },
                { name: 'API Latency', value: `${apiLatency}ms`, inline: true }
            )
            .setTimestamp() // Adds a timestamp to the embed
            .setFooter({ text: 'Ping Command' }); // A small footer

        // Edit the deferred reply to show the ping embed
        await interaction.editReply({ embeds: [pingEmbed] });
    },
};
