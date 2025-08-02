/**
 * Ping Command
 * A simple command to test bot responsiveness and display latency
 */

const { SlashCommandBuilder } = require('discord.js');
const { CustomEmbedBuilder, THEME } = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check the bot\'s latency and responsiveness'),

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder(interaction.client);

        // Create initial loading embed
        const loadingEmbed = embedBuilder.loading(
            'Calculating Ping...',
            'Please wait while I measure the response time.'
        );

        // Reply with loading embed and measure response time
        const sent = await interaction.reply({ 
            embeds: [loadingEmbed], 
            fetchReply: true 
        });

        // Calculate latencies
        const roundtripLatency = sent.createdTimestamp - interaction.createdTimestamp;
        const websocketLatency = Math.round(interaction.client.ws.ping);

        // Determine ping quality and emoji
        let pingQuality = 'Excellent';
        let pingColor = 'success';
        let pingEmoji = THEME.emojis.success;

        if (roundtripLatency > 200) {
            pingQuality = 'Poor';
            pingColor = 'error';
            pingEmoji = THEME.emojis.error;
        } else if (roundtripLatency > 100) {
            pingQuality = 'Fair';
            pingColor = 'warning';
            pingEmoji = '⚠️';
        }

        // Create final response embed
        const resultEmbed = embedBuilder.createBaseEmbed(pingColor)
            .setTitle(`${THEME.emojis.ping} Pong!`)
            .setDescription(`Bot is online and responding. Connection quality: **${pingQuality}**`)
            .addFields([
                {
                    name: '🏓 Roundtrip Latency',
                    value: `\`${roundtripLatency}ms\``,
                    inline: true
                },
                {
                    name: '💓 WebSocket Heartbeat',
                    value: `\`${websocketLatency}ms\``,
                    inline: true
                },
                {
                    name: '📊 Status',
                    value: `${pingEmoji} ${pingQuality}`,
                    inline: true
                }
            ])
            .setThumbnail(interaction.client.user.displayAvatarURL());

        // Edit the original response with the results
        await interaction.editReply({ embeds: [resultEmbed] });
    },
};