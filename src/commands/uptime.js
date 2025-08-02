// src/commands/uptime.js
const { SlashCommandBuilder } = require('discord.js');
const { CustomEmbedBuilder, THEME } = require('../utils/embedBuilder'); // Use your existing import structure
const prettyMs = require('pretty-ms'); // You'll need to install this package: npm install pretty-ms

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Displays how long the bot has been running.'),
    async execute(interaction) {
        // Instantiate CustomEmbedBuilder just like in serverinfo.js
        const embedBuilder = new CustomEmbedBuilder(interaction.client);

        const uptimeInMs = interaction.client.uptime; // Uptime is in milliseconds
        const readableUptime = prettyMs(uptimeInMs, { verbose: true, secondsDecimalDigits: 0 });

        const embed = embedBuilder.info( // Using info embed type
            'Bot Uptime',
            `${THEME.emojis.star} I have been online for: \`${readableUptime}\`` // Using a themed emoji
        );

        await interaction.reply({ embeds: [embed] });
    },
};