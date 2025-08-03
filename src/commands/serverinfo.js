/**
 * serverinfo.js
 * Provides information about the current server.
 */

const { SlashCommandBuilder } = require('discord.js');
const { CustomEmbedBuilder } = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Displays information about the server.'),
    async execute(interaction) {
        // The deferReply() is now handled in interactionCreate.js
        // No need to defer here, as it would cause an error.
        
        try {
            const guild = interaction.guild;
            const owner = await guild.fetchOwner();
            const memberCount = guild.memberCount;
            const onlineMembers = guild.members.cache.filter(member => member.presence?.status !== 'offline').size;
            const channelCount = guild.channels.cache.size;

            const serverInfoEmbed = new CustomEmbedBuilder(interaction.client)
                .info('Server Information')
                .addFields(
                    { name: 'Server Name', value: guild.name, inline: true },
                    { name: 'Server ID', value: guild.id, inline: true },
                    { name: 'Owner', value: `<@${owner.user.id}>`, inline: true },
                    { name: 'Member Count', value: `${memberCount}`, inline: true },
                    { name: 'Online Members', value: `${onlineMembers}`, inline: true },
                    { name: 'Channels', value: `${channelCount}`, inline: true },
                    { name: 'Created At', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:f>`, inline: false }
                );

            // Use editReply() instead of reply() because the interaction has been deferred.
            await interaction.editReply({ embeds: [serverInfoEmbed] });
            
        } catch (error) {
            console.error('[ERROR] Failed to fetch server information:', error);
            const errorEmbed = new CustomEmbedBuilder(interaction.client).error(
                'Server Info Error',
                'Failed to retrieve server information. Please try again later.'
            );
            await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
