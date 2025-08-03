/**
 * User Info Command
 * Displays detailed information about a Discord user
 */

const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { CustomEmbedBuilder, THEME } = require('../utils/embedBuilder');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Display detailed information about a user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to get information about')
                .setRequired(false)
        ),

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder(interaction.client);
        
        // Get the target user (either mentioned user or command author)
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const targetMember = interaction.guild.members.cache.get(targetUser.id);

        // Fetch the full user to get flags/badges
        let fullUser;
        try {
            // Force fetch with cache bypass to get all user data including flags
            fullUser = await interaction.client.users.fetch(targetUser.id, { force: true, cache: false });
            console.log(`📊 Fetched user data for ${fullUser.username} (${fullUser.id})`);
        } catch (error) {
            fullUser = targetUser;
            console.error('❌ Could not fetch full user data:', error.message);
        }

        // User account info
        const createdAt = fullUser.createdAt;
        const accountAge = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        const badges = fullUser.flags?.toArray() || [];

        // Member info (if user is in the guild)
        let joinedAt, memberAge, roles, permissions;
        if (targetMember) {
            joinedAt = targetMember.joinedAt;
            memberAge = Math.floor((Date.now() - joinedAt.getTime()) / (1000 * 60 * 60 * 24));
            roles = targetMember.roles.cache
                .filter(role => role.id !== interaction.guild.roles.everyone.id)
                .sort((a, b) => b.position - a.position)
                .map(role => role.toString());
            
            permissions = targetMember.permissions.toArray()
                .filter(p => p !== 'ViewChannel' && p !== 'ReadMessageHistory' && p !== 'SendMessages')
                .map(p => `\`${p}\``);
        }

        const userInfoEmbed = embedBuilder.info(
            `User Info for ${fullUser.username}`,
            `A detailed profile of the user.`,
            [
                {
                    name: '🆔 User ID',
                    value: `\`${fullUser.id}\``,
                    inline: false
                },
                {
                    name: '👤 Account Info',
                    value: [
                        `**Created:** <t:${Math.floor(createdAt.getTime() / 1000)}:F>`,
                        `**Age:** ${accountAge} days`
                    ].join('\n'),
                    inline: true
                }
            ]
        );

        if (targetMember) {
            userInfoEmbed.addFields({
                name: '📊 Member Info',
                value: [
                    `**Joined:** <t:${Math.floor(joinedAt.getTime() / 1000)}:F>`,
                    `**Member Age:** ${memberAge} days`
                ].join('\n'),
                inline: true
            });
        }
        
        // Use placeholders for avatar and banner
        userInfoEmbed
        .setThumbnail(fullUser.displayAvatarURL({ dynamic: true, size: 1024 }) || embedBuilder.getPlaceholder('avatar'))
        .setImage(fullUser.bannerURL({ dynamic: true, size: 1024 }) || null); // Note: Discord banners are often not available, null is a good fallback

        // Add roles if user is in server
        if (targetMember && roles.length > 0) {
            userInfoEmbed.addFields({
                name: `🎭 Roles [${targetMember.roles.cache.size - 1}]`,
                value: roles.length > 0 ? roles.join(' ') : 'No roles',
                inline: false
            });
        }

        // Add permissions if user has any
        if (targetMember && permissions.length > 0) {
            userInfoEmbed.addFields({
                name: '🔑 Key Permissions',
                value: permissions.join(', '),
                inline: false
            });
        }

        // Add badges if user has any
        if (badges.length > 0) {
            userInfoEmbed.addFields({
                name: '🏆 Badges',
                value: badges.join('\n'),
                inline: false
            });
        }

        // Add status information if user is in server
        if (targetMember) {
            const status = targetMember.presence?.status || 'offline';
            const statusEmojis = {
                'online': '🟢',
                'idle': '🟡',
                'dnd': '🔴',
                'offline': '⚫'
            };

            userInfoEmbed.addFields({
                name: '📱 Status',
                value: `${statusEmojis[status]} ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                inline: true
            });
        }

        await interaction.reply({ embeds: [userInfoEmbed] });
    },
};
