// src/commands/uptime.js
const { SlashCommandBuilder } = require('discord.js');
const { CustomEmbedBuilder, THEME } = require('../utils/embedBuilder'); // Import the class and THEME
const prettyMs = require('pretty-ms'); // You'll need to install this package: npm install pretty-ms

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Displays how long the bot has been running.'),
    async execute(interaction) {
        // Create an instance of CustomEmbedBuilder for this interaction
        const embedBuilder = new CustomEmbedBuilder(interaction.client);

        const uptimeInMs = interaction.client.uptime; // Uptime is in milliseconds
        const readableUptime = prettyMs(uptimeInMs, { verbose: true, secondsDecimalDigits: 0 });

        const embed = embedBuilder.createBaseEmbed('info')
            .setTitle(`${THEME.emojis.info} Bot Uptime`)
            .setDescription(`I have been online for: \`${readableUptime}\``);

        await interaction.reply({ embeds: [embed] });
    },
};