/**
 * Server Info Command
 * Displays detailed information about the server.
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const moment = require('moment'); // Make sure you have this library installed

module.exports = {
    category: 'Information',
    
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Displays detailed information about the server'),

    async execute(interaction) {
        // Defer the reply immediately to prevent a timeout.
        await interaction.deferReply();

        const { guild } = interaction;
        const owner = await guild.fetchOwner();
        
        const serverEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(`${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
            .addFields(
                { name: 'Server Owner:', value: `<@${owner.id}>`, inline: true },
                { name: 'Server ID:', value: `\`${guild.id}\``, inline: true },
                { name: 'Created On:', value: moment(guild.createdAt).format('LL'), inline: true },
                { name: 'Member Count:', value: `${guild.memberCount}`, inline: true },
                { name: 'Channels:', value: `${guild.channels.cache.size}`, inline: true },
                { name: 'Roles:', value: `${guild.roles.cache.size}`, inline: true },
                { name: 'Boosts:', value: `${guild.premiumSubscriptionCount || 0} (Level ${guild.premiumTier})`, inline: true },
                { name: 'Verification Level:', value: guild.verificationLevel.toString().replace(/_/g, ' '), inline: true },
                { name: 'Features:', value: guild.features.length ? guild.features.map(f => `\`${f}\``).join(', ') : 'None', inline: false }
            )
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.tag}` });

        await interaction.editReply({ embeds: [serverEmbed] });
    },
};
