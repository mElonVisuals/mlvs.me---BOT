/**
 * userinfo.js
 * Provides information about a user.
 */

const { SlashCommandBuilder } = require('discord.js');
const { CustomEmbedBuilder } = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Displays information about a user.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to get information about')
        ),
    async execute(interaction) {
        // The deferReply() is now handled in interactionCreate.js
        // No need to defer here, as it would cause an error.
        
        try {
            const targetUser = interaction.options.getUser('target') || interaction.user;
            const member = interaction.guild.members.cache.get(targetUser.id);
            
            const userInfoEmbed = new CustomEmbedBuilder(interaction.client)
                .info(`User Information for ${targetUser.tag}`)
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: 'User Tag', value: targetUser.tag, inline: true },
                    { name: 'User ID', value: targetUser.id, inline: true },
                    { name: 'Bot Account', value: targetUser.bot ? 'Yes' : 'No', inline: true },
                    { name: 'Account Created', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:f>`, inline: false },
                    { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:f>`, inline: false },
                    { name: 'Roles', value: member.roles.cache.map(role => role.toString()).join(' ') || 'None', inline: false }
                );

            // Use editReply() instead of reply() because the interaction has been deferred.
            await interaction.editReply({ embeds: [userInfoEmbed] });
            
        } catch (error) {
            console.error(`[ERROR] Failed to fetch user information for user ${interaction.user.tag}:`, error);
            const errorEmbed = new CustomEmbedBuilder(interaction.client).error(
                'User Info Error',
                'Failed to retrieve user information. Please try again later.'
            );
            await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
