/**
 * serverinfo.js
 * Provides information about the current server.
 * This version includes improved error handling and data validation.
 */

const { SlashCommandBuilder } = require('discord.js');
const { CustomEmbedBuilder } = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Displays information about the server.'),
    async execute(interaction) {
        // Since the central interactionCreate event handler now defers all replies,
        // we can proceed with the command logic and use editReply() at the end.
        
        try {
            const guild = interaction.guild;
            if (!guild) {
                // This is a safety check, though this error is unlikely with slash commands.
                await interaction.editReply({ content: 'I could not find a server to get information about.', ephemeral: true });
                return;
            }

            const owner = await guild.fetchOwner().catch(() => null);
            const memberCount = guild.memberCount || 'Unknown';
            const onlineMembers = guild.members.cache.filter(member => member.presence?.status !== 'offline').size || 'Unknown';
            const channelCount = guild.channels.cache.size || 'Unknown';
            const guildDescription = guild.description || 'No description provided.';
            const verificationLevel = guild.verificationLevel || 0;
            const boostLevel = guild.premiumTier || 0;

            const serverInfoEmbed = new CustomEmbedBuilder(interaction.client)
                .info('Server Information')
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .addFields(
                    { name: 'Server Name', value: guild.name, inline: true },
                    { name: 'Server ID', value: guild.id, inline: true },
                    { name: 'Owner', value: owner ? `<@${owner.user.id}>` : 'Unknown', inline: true },
                    { name: 'Member Count', value: `${memberCount}`, inline: true },
                    { name: 'Online Members', value: `${onlineMembers}`, inline: true },
                    { name: 'Channels', value: `${channelCount}`, inline: true },
                    { name: 'Boost Level', value: `Level ${boostLevel}`, inline: true },
                    { name: 'Verification Level', value: `${verificationLevel}`, inline: true },
                    { name: 'Created At', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:f>`, inline: false }
                );
            
            // Add description field separately to ensure it is not inline.
            if (guildDescription) {
                serverInfoEmbed.setDescription(guildDescription);
            }

            // Use editReply() because the interaction has been deferred in the main event handler.
            await interaction.editReply({ embeds: [serverInfoEmbed] });
            
        } catch (error) {
            console.error('[ERROR] Failed to execute serverinfo command:', error);
            const errorEmbed = new CustomEmbedBuilder(interaction.client).error(
                'Server Info Error',
                'An unexpected error occurred while retrieving server information. Please try again later.'
            );
            await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
