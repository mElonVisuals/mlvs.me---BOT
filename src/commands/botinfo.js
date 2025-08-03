// src/commands/botinfo.js

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const moment = require('moment');

module.exports = {
    category: 'Utility',
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Displays information about the bot and its stats.'),

    async execute(interaction) {
        const { client, guild } = interaction;

        // Get the total number of users in the guild using the memberCount property
        // This is more reliable than counting cached members
        const memberCount = guild.memberCount;
        
        // Get the number of users in the guild
        const userCount = guild.members.cache.filter(member => !member.user.bot).size;
        
        // Get the bot count
        const botCount = guild.members.cache.filter(member => member.user.bot).size;
        
        // Calculate uptime
        const uptime = moment.duration(client.uptime).humanize();

        const botInfoEmbed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle(`🤖 ${client.user.username} Bot Information`)
            .setDescription('Here is some information about the bot:')
            .addFields(
                { name: 'Server Name', value: `${guild.name}`, inline: true },
                { name: 'Total Members', value: `${memberCount}`, inline: true },
                { name: 'Users', value: `${userCount}`, inline: true },
                { name: 'Bots', value: `${botCount}`, inline: true },
                { name: 'Uptime', value: `${uptime}`, inline: true },
                { name: 'Ping', value: `${client.ws.ping}ms`, inline: true },
            )
            .setThumbnail(client.user.displayAvatarURL())
            .setFooter({ text: `Requested by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [botInfoEmbed] });
    },
};
