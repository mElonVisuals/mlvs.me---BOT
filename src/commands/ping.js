/**
 * This is the ping.js command file.
 * It's designed to work with a Discord bot using discord.js v14 and slash commands.
 * This command replies with Pong! and shows the bot's latency.
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong! and shows the bot\'s latency.'),

    async execute(interaction) {
        // We'll send a direct reply since this command is very fast.
        const apiLatency = interaction.client.ws.ping;

        const pingEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('Pong! 🏓')
            .addFields(
                // Note: We can't get a perfect "bot latency" without deferring,
                // but for a fast command like this, the API latency is the most useful metric.
                { name: 'API Latency', value: `${apiLatency}ms`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Ping Command' });

        await interaction.reply({ embeds: [pingEmbed] });
    },
};
