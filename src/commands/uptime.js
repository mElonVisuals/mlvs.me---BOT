// src/commands/uptime.js

const { SlashCommandBuilder } = require('discord.js');
const { CustomEmbedBuilder, THEME } = require('../utils/embedBuilder');
const prettyMs = require('pretty-ms');

module.exports = {
    // Add a category property
    category: 'Utility',

    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Displays how long the bot has been running.'),
    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder(interaction.client);

        const uptimeInMs = interaction.client.uptime;
        const readableUptime = prettyMs(uptimeInMs, { verbose: true, secondsDecimalDigits: 0 });

        const embed = embedBuilder.info(
            'Bot Uptime',
            `${THEME.emojis.star} I have been online for: \`${readableUptime}\``
        );

        await interaction.reply({ embeds: [embed] });
    },
};
