/**
 * userinfo.js
 * Provides information about a user.
 * This version includes improved error handling and data validation.
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
                .setRequired(false)),
    async execute(interaction) {
        // Since the central interactionCreate event handler now defers all replies,
        // we can proceed with the command logic and use editReply() at the end.
        
        try {
            const member = interaction.options.getMember('target') || interaction.member;
            if (!member) {
                await interaction.editReply({ content: 'I could not find that user.', ephemeral: true });
                return;
            }

            const user = member.user;

            const userCreationDate = user.createdAt ? `<t:${Math.floor(user.createdTimestamp / 1000)}:f>` : 'N/A';
            const memberJoinDate = member.joinedAt ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:f>` : 'N/A';
            const userNickname = member.nickname || 'None';
            const userStatus = member.presence?.status || 'offline';
            const userRoles = member.roles.cache.size > 1 ? member.roles.cache.map(role => `<@&${role.id}>`).join(', ') : 'None';

            const userInfoEmbed = new CustomEmbedBuilder(interaction.client)
                .info('User Information')
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: 'User Tag', value: user.tag, inline: true },
                    { name: 'User ID', value: user.id, inline: true },
                    { name: 'Nickname', value: userNickname, inline: true },
                    { name: 'Status', value: userStatus, inline: true },
                    { name: 'Joined Server', value: memberJoinDate, inline: true },
                    { name: 'Account Created', value: userCreationDate, inline: true },
                    { name: 'Roles', value: userRoles.length > 1024 ? 'Too many roles to display.' : userRoles, inline: false }
                );

            await interaction.editReply({ embeds: [userInfoEmbed] });

        } catch (error) {
            console.error('[ERROR] Failed to execute userinfo command:', error);
            const errorEmbed = new CustomEmbedBuilder(interaction.client).error(
                'User Info Error',
                'An unexpected error occurred while retrieving user information. Please try again later.'
            );
            await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
