/**
 * User Info Command
 * Displays detailed information about a Discord user
 */

const { SlashCommandBuilder } = require('discord.js');
const { CustomEmbedBuilder, THEME } = require('../utils/embedBuilder');

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

        // User account information
        const accountCreated = targetUser.createdAt;
        const accountAge = Math.floor((Date.now() - accountCreated.getTime()) / (1000 * 60 * 60 * 24));

        // Server-specific information (if user is in server)
        let joinedServer = null;
        let serverAge = null;
        let roles = [];
        let nickname = null;
        let permissions = [];

        if (targetMember) {
            joinedServer = targetMember.joinedAt;
            serverAge = joinedServer ? Math.floor((Date.now() - joinedServer.getTime()) / (1000 * 60 * 60 * 24)) : null;
            nickname = targetMember.nickname;
            
            // Get roles (excluding @everyone)
            roles = targetMember.roles.cache
                .filter(role => role.id !== interaction.guild.id)
                .sort((a, b) => b.position - a.position)
                .map(role => role.toString())
                .slice(0, 20); // Limit to prevent embed overflow

            // Get key permissions
            if (targetMember.permissions.has('Administrator')) {
                permissions.push('Administrator');
            } else {
                const keyPerms = [
                    'ManageGuild', 'ManageRoles', 'ManageChannels', 
                    'ManageMessages', 'KickMembers', 'BanMembers',
                    'ModerateMembers', 'ManageNicknames'
                ];
                
                permissions = keyPerms.filter(perm => 
                    targetMember.permissions.has(perm)
                ).map(perm => {
                    // Convert permission names to readable format
                    return perm.replace(/([A-Z])/g, ' $1').trim();
                });
            }
        }

        // Determine user badges/flags
        const badges = [];
        
        console.log(`🔍 Checking badges for ${fullUser.username}:`);
        console.log(`   - User flags exist: ${!!fullUser.flags}`);
        console.log(`   - Flags bitfield: ${fullUser.flags?.bitfield || 'none'}`);
        console.log(`   - Has avatar decoration: ${!!fullUser.avatarDecoration}`);
        console.log(`   - Has banner: ${!!fullUser.banner}`);
        
        if (fullUser.flags && fullUser.flags.bitfield > 0) {
            const flagMap = {
                'Staff': '👨‍💼 Discord Staff',
                'Partner': '🤝 Discord Partner',
                'Hypesquad': '🎉 HypeSquad Events',
                'BugHunterLevel1': '🐛 Bug Hunter Level 1',
                'BugHunterLevel2': '🐛 Bug Hunter Level 2',
                'HypesquadOnlineHouse1': '🏠 HypeSquad Bravery',
                'HypesquadOnlineHouse2': '🏠 HypeSquad Brilliance',
                'HypesquadOnlineHouse3': '🏠 HypeSquad Balance',
                'PremiumEarlySupporter': '⭐ Early Nitro Supporter',
                'VerifiedDeveloper': '🔧 Verified Bot Developer',
                'CertifiedModerator': '🛡️ Certified Moderator',
                'BotHTTPInteractions': '🤖 HTTP Interactions Bot',
                'ActiveDeveloper': '🔨 Active Developer',
                'VerifiedBot': '✅ Verified Bot'
            };

            try {
                const userFlags = fullUser.flags.toArray();
                console.log(`   - Detected flags: [${userFlags.join(', ')}]`);
                
                userFlags.forEach(flag => {
                    if (flagMap[flag]) {
                        badges.push(flagMap[flag]);
                        console.log(`   ✅ Added badge: ${flagMap[flag]}`);
                    } else {
                        console.log(`   ❓ Unknown flag: ${flag}`);
                    }
                });
            } catch (flagError) {
                console.error('   ❌ Error processing flags:', flagError.message);
            }
        } else {
            console.log('   ℹ️ No public flags found for this user');
        }

        // Check for Nitro indicators
        if (fullUser.avatarDecoration || fullUser.banner || fullUser.accentColor) {
            const hasNitroBadge = badges.some(badge => badge.includes('Nitro') || badge.includes('Early'));
            if (!hasNitroBadge) {
                badges.push('💎 Nitro Subscriber');
                console.log('   ✅ Added Nitro badge based on profile features');
            }
        }

        console.log(`   📋 Final badges: [${badges.join(', ')}]`);

        // Build the embed
        const userInfoEmbed = embedBuilder.info(
            `${targetUser.username}'s Profile`,
            `Detailed information about ${targetUser.toString()}`,
            [
                {
                    name: '👤 User Information',
                    value: [
                        `**Username:** ${targetUser.username}`,
                        `**Display Name:** ${targetUser.displayName}`,
                        `**ID:** \`${targetUser.id}\``,
                        `**Bot:** ${targetUser.bot ? 'Yes' : 'No'}`,
                        nickname ? `**Nickname:** ${nickname}` : null
                    ].filter(Boolean).join('\n'),
                    inline: true
                },
                {
                    name: '📅 Account Details',
                    value: [
                        `**Created:** <t:${Math.floor(accountCreated.getTime() / 1000)}:F>`,
                        `**Account Age:** ${accountAge} days`,
                        joinedServer ? `**Joined Server:** <t:${Math.floor(joinedServer.getTime() / 1000)}:F>` : null,
                        serverAge ? `**Server Member For:** ${serverAge} days` : null
                    ].filter(Boolean).join('\n'),
                    inline: true
                },
                {
                    name: '🎨 Avatar',
                    value: `[View Full Size](${fullUser.displayAvatarURL({ dynamic: true, size: 1024 })})`,
                    inline: true
                }
            ]
        )
        .setThumbnail(fullUser.displayAvatarURL({ dynamic: true, size: 256 }))
        .setImage(fullUser.bannerURL({ dynamic: true, size: 1024 }) || null);

        // Add roles if user is in server
        if (roles.length > 0) {
            userInfoEmbed.addFields({
                name: `🎭 Roles [${targetMember.roles.cache.size - 1}]`,
                value: roles.length > 0 ? roles.join(' ') : 'No roles',
                inline: false
            });
        }

        // Add permissions if user has any
        if (permissions.length > 0) {
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