// src/commands/ping.js

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    // Add a category property to the command module
    category: 'Utility', 
    
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check the bot\'s latency and responsiveness'),

    async execute(interaction) {
        // Create a temporary loading embed to be shown while the bot calculates the ping
        const loadingEmbed = new EmbedBuilder()
            .setColor(0x5865F2) // Discord's main brand color for a modern look
            .setTitle('Pinging...')
            .setDescription('Measuring bot latency. Please wait a moment.');

        // Reply with the loading embed and fetch the reply message
        const sent = await interaction.reply({ 
            embeds: [loadingEmbed], 
            fetchReply: true 
        });

        // Calculate the roundtrip latency by subtracting the interaction timestamp
        // from the reply message's timestamp
        const roundtripLatency = sent.createdTimestamp - interaction.createdTimestamp;

        // Get the WebSocket heartbeat ping from the client object
        const websocketLatency = Math.round(interaction.client.ws.ping);

        // Determine the color and description based on the roundtrip latency
        let embedColor = 0x5865F2; // Default to Discord blue
        let statusDescription = `Bot is online and responding.`;

        if (roundtripLatency > 200) {
            embedColor = 0xFEE75C; // Warning yellow
            statusDescription = `A response time of \`${roundtripLatency}ms\` indicates a poor connection quality.`;
        } else if (roundtripLatency > 100) {
            embedColor = 0xFAA61A; // Orange
            statusDescription = `The roundtrip latency of \`${roundtripLatency}ms\` suggests a fair connection.`;
        }

        // Create the final, updated embed with all the information
        const resultEmbed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle('🏓 Pong!')
            .setDescription(statusDescription)
            .addFields(
                {
                    name: 'Roundtrip Latency',
                    value: `\`${roundtripLatency}ms\``,
                    inline: true
                },
                {
                    name: 'WebSocket Heartbeat',
                    value: `\`${websocketLatency}ms\``,
                    inline: true
                }
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({
                text: interaction.client.user.username,
                iconURL: interaction.client.user.displayAvatarURL()
            });

        // Edit the original reply with the new, final embed
        await interaction.editReply({ embeds: [resultEmbed] });
    },
};
