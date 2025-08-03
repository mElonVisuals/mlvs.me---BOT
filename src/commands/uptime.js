// src/commands/uptime.js

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const prettyMs = require('pretty-ms');

module.exports = {
    // Add a category property
    category: 'Utility',

    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Displays how long the bot has been running.'),

    async execute(interaction) {
        // Calculate uptime in milliseconds from the client
        const uptimeInMs = interaction.client.uptime;
        
        // Use pretty-ms to format the uptime into a human-readable string
        const readableUptime = prettyMs(uptimeInMs, { verbose: true, secondsDecimalDigits: 0 });

        // Get the bot's launch timestamp and format it for a relative timestamp
        const launchTime = Math.floor((Date.now() - uptimeInMs) / 1000);

        // Create the new, improved embed
        const uptimeEmbed = new EmbedBuilder()
            .setColor(0x5865F2) // A standard Discord blue for a clean look
            .setTitle('🤖 Bot Uptime')
            .setDescription('Here is a breakdown of my current uptime.')
            .addFields(
                { 
                    name: 'Duration', 
                    value: `**\`${readableUptime}\`**`, 
                    inline: false 
                },
                {
                    name: 'Launch Time',
                    value: `I was last launched <t:${launchTime}:R> on <t:${launchTime}:f>.`,
                    inline: false
                }
            )
            .setTimestamp()
            .setFooter({
                text: interaction.client.user.username,
                iconURL: interaction.client.user.displayAvatarURL()
            });

        await interaction.reply({ embeds: [uptimeEmbed] });
    },
};
