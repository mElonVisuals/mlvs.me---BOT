/**
 * @file botinfo.js
 * @description Provides information about the bot.
 * This version removes duplicate deferral and handles errors gracefully.
 */

const { SlashCommandBuilder } = require('discord.js');
const { CustomEmbedBuilder } = require('../utils/embedBuilder');
const { getBotUptime } = require('../utils/utils');
const os = require('os');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Displays information about the bot.'),
    async execute(interaction) {
        try {
            const client = interaction.client;
            
            // As per your interactionCreate event, the reply is already deferred.
            // Awaiting interaction.deferReply() here would cause an error.

            const botAvatar = client.user.displayAvatarURL({ dynamic: true });
            const botUptime = getBotUptime(client.uptime);
            const serverCount = client.guilds.cache.size;
            const userCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
            const memoryUsage = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
            const cpuUsage = (os.loadavg()[0] || 'Unknown').toFixed(2);
            
            // Construct fields array to be passed to the embed method
            const fields = [
                { name: 'Developer', value: `<@${process.env.DEVELOPER_ID || 'N/A'}>`, inline: true },
                { name: 'Servers', value: `${serverCount}`, inline: true },
                { name: 'Users', value: `${userCount}`, inline: true },
                { name: 'Uptime', value: botUptime, inline: false },
                { name: 'Memory Usage', value: `${memoryUsage} MB`, inline: true },
                { name: 'CPU Usage (1 min avg)', value: `${cpuUsage}%`, inline: true },
                { name: 'Node.js Version', value: process.version, inline: true }
            ];

            // Use the info method with null for description, and pass the fields array
            const embed = new CustomEmbedBuilder(client)
                .info('Bot Information', null, fields)
                .setThumbnail(botAvatar);

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('[ERROR] An error occurred while executing command botinfo:', error);
            const errorEmbed = new CustomEmbedBuilder(interaction.client).error(
                'Bot Info Error',
                'An unexpected error occurred while retrieving bot information. Please try again later.'
            );
            await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
