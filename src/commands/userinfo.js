// src/commands/userinfo.js

const { SlashCommandBuilder } = require('discord.js');
const { CustomEmbedBuilder, THEME } = require('../utils/embedBuilder');

module.exports = {
    // Add a category property
    category: 'General',

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
        
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const targetMember = interaction.guild.members.cache.get(targetUser.id);

        let fullUser;
        try {
            fullUser = await interaction.client.users.fetch(targetUser.id, { force: true, cache: false });
            console.log(`📊 Fetched user data for ${fullUser.username} (${fullUser.id})`);
        } catch (error) {
            fullUser = targetUser;
            console.error('❌ Could not fetch full user data:', error.message);
        }

        const userCreatedAt = targetUser.createdAt;
        const accountAge = Math.floor((Date.now() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24));
        const memberJoinedAt = targetMember?.joinedAt;
        const memberAge = memberJoinedAt ? Math.floor((Date.now() - memberJoinedAt.getTime()) / (1000 * 60 * 60 * 24)) : null;

        const roles = targetMember ? targetMember.roles.cache
            .filter(role => role.id !== interaction.guild.id)
            .sort((a, b) => b.position - a.position)
            .map(role => `<@&${role.id}>`)
            .join(' ') : 'Not in this server';

        const permissions = targetMember ? targetMember.permissions.toArray()
            .map(p => `\`${p}\``)
            .sort()
            .join(', ') : 'N/A';

        const badges = fullUser.flags?.toArray() || [];

        const userInfoEmbed = embedBuilder.info(
            `User Info: ${targetUser.username}`,
            `A detailed overview of **${targetUser.username}**.`
        )
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 1024 }))
        .addFields(
            [
                {
                    name: '👤 User Details',
                    value: [
                        `**ID:** \`${targetUser.id}\``,
                        `**Bot:** ${targetUser.bot ? '✅ Yes' : '❌ No'}`,
                        `**Account Created:** <t:${Math.floor(userCreatedAt.getTime() / 1000)}:F>`,
                        `**Account Age:** ${accountAge} days`
                    ].join('\n'),
                    inline: false
                }
            ]
        );

        if (targetMember) {
            userInfoEmbed.addFields({
                name: 'Server Details',
                value: [
                    `**Joined Server:** <t:${Math.floor(memberJoinedAt.getTime() / 1000)}:F>`,
                    `**Joined Age:** ${memberAge} days`,
                    `**Nickname:** ${targetMember.nickname || 'None'}`
                ].join('\n'),
                inline: false
            });
        }
        
        userInfoEmbed.setTimestamp(new Date());
        userInfoEmbed.setImage(fullUser.bannerURL({ dynamic: true, size: 1024 }) || null);

        if (roles.length > 0) {
            userInfoEmbed.addFields({
                name: `🎭 Roles [${targetMember.roles.cache.size - 1}]`,
                value: roles.length > 0 ? roles : 'No roles',
                inline: false
            });
        }

        if (permissions.length > 0) {
            userInfoEmbed.addFields({
                name: '🔑 Key Permissions',
                value: permissions.join(', '),
                inline: false
            });
        }

        if (badges.length > 0) {
            const badgeEmojis = {
                'Staff': '<:staff:1400984419992592476>', // Replace with your emoji IDs
                'Partner': '<:partner:1400984419992592476>',
                'Hypesquad': '<:hypesquad:1400984419992592476>',
                'BugHunterLevel1': '<:bughunter:1400984419992592476>',
                'BugHunterLevel2': '<:bughunter:1400984419992592476>',
                'HypeSquadOnlineHouse1': '<:bravery:1400984419992592476>',
                'HypeSquadOnlineHouse2': '<:brilliance:1400984419992592476>',
                'HypeSquadOnlineHouse3': '<:balance:1400984419992592476>',
                'PremiumEarlySupporter': '<:earlysupporter:1400984419992592476>',
                'TeamPseudoUser': '<:team:1400984419992592476>',
                'VerifiedBot': '<:verifiedbot:1400984419992592476>',
                'VerifiedDeveloper': '<:verifieddev:1400984419992592476>',
                'CertifiedModerator': '<:moderator:1400984419992592476>',
                'ActiveDeveloper': '<:activedev:1400984419992592476>'
            };
            const badgeList = badges.map(badge => badgeEmojis[badge] || badge).join(' ');
            
            userInfoEmbed.addFields({
                name: '🏆 Badges',
                value: badgeList,
                inline: false
            });
        }

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
