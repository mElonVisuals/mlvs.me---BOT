/**
 * Bot Info Command
 * Displays detailed information about the bot, including latency.
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const moment = require('moment');

module.exports = {
    category: 'Information',
    
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Displays information about the bot'),

    async execute(interaction) {
        // Defer the reply immediately to prevent a timeout and to provide more time for processing.
        await interaction.deferReply();

        // Calculate the bot's latency and Discord API latency
        const botLatency = Math.round(interaction.client.ws.ping);
        const apiLatency = Date.now() - interaction.createdTimestamp;

        const infoEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(`Bot Information`)
            .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .addFields(
                { name: 'Bot Tag:', value: `\`${interaction.client.user.tag}\``, inline: true },
                { name: 'Bot ID:', value: `\`${interaction.client.user.id}\``, inline: true },
                { name: '\u200B', value: '\u200B', inline: true }, // Empty field for spacing
                { name: 'Developer:', value: 'melon.is', inline: true },
                { name: 'Created On:', value: moment(interaction.client.user.createdAt).format('LL'), inline: true },
                { name: 'Servers:', value: `${interaction.client.guilds.cache.size}`, inline: true },
                { name: 'Total Users:', value: `${interaction.client.users.cache.size}`, inline: true },
                { name: 'Ping:', value: `Heartbeat: \`${botLatency}ms\`\nAPI Latency: \`${apiLatency}ms\``, inline: true },
                { name: 'Commands:', value: `${interaction.client.commands.size}`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.tag}` });

        await interaction.editReply({ embeds: [infoEmbed] });
    },
};
