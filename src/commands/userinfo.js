/**
 * User Info Command
 * Displays detailed information about a Discord user
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    // Command data
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Display detailed information about a user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to get information about')
                .setRequired(false)
        ),

    // Execute function
    async execute(interaction) {
        // Defer the reply to give the bot time to process the command
        await interaction.deferReply();

        // Get the target user (either mentioned user or command author)
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const targetMember = interaction.guild.members.cache.get(targetUser.id);

        // Fetch the full user to get flags/badges
        let fullUser = targetUser;
        try {
            // Force fetch with cache bypass to get all user data including flags
            fullUser = await interaction.client.users.fetch(targetUser.id, { force: true, cache: false });
        } catch (error) {
            console.error('Could not fetch full user data:', error.message);
        }

        // Create the new embed
        const userInfoEmbed = new EmbedBuilder()
            // Set the color and title to match the requested style
            .setColor(0x2b2d31) // A dark, Discord-like gray
            .setTitle(`User Info - ${fullUser.username}`)
            // Set the thumbnail to the user's avatar
            .setThumbnail(fullUser.displayAvatarURL({ dynamic: true, size: 1024 }))
            // Add a timestamp and footer
            .setTimestamp()
            .setFooter({
                text: `${interaction.guild.name}`, // You can customize this
                iconURL: interaction.guild.iconURL()
            });

        // ====================================================================
        //                       General Section
        // ====================================================================

        // Format user badges/flags
        const badges = fullUser.flags?.toArray()
            .map(flag => {
                // Convert flag names to emojis for a cleaner look
                switch (flag) {
                    case 'Staff': return 'Discord Staff';
                    case 'Partner': return 'Discord Partner';
                    case 'Hypesquad': return 'HypeSquad Events';
                    case 'BugHunterLevel1': return 'Bug Hunter Level 1';
                    case 'BugHunterLevel2': return 'Bug Hunter Level 2';
                    case 'HypeSquadOnlineHouse1': return 'HypeSquad Bravery';
                    case 'HypeSquadOnlineHouse2': return 'HypeSquad Brilliance';
                    case 'HypeSquadOnlineHouse3': return 'HypeSquad Balance';
                    case 'PremiumEarlySupporter': return 'Early Supporter';
                    case 'TeamPseudoUser': return 'Team User';
                    case 'VerifiedBot': return 'Verified Bot';
                    case 'VerifiedDeveloper': return 'Verified Developer';
                    case 'ActiveDeveloper': return 'Active Developer';
                    default: return flag;
                }
            })
            .join(', ');

        const generalFields = [
            // Section header
            { name: '**__- General:__**', value: '\u200b', inline: false },
            { name: 'Username:', value: `👑 ${fullUser.username}`, inline: true },
            { name: 'ID:', value: `🆔 \`${fullUser.id}\``, inline: true },
            { name: '\u200b', value: '\u200b', inline: true }, // Spacer
            {
                name: 'Account Created:',
                value: `🗓️ <t:${Math.floor(fullUser.createdAt.getTime() / 1000)}:R>`,
                inline: true
            },
        ];

        // Add member-specific general info if available
        if (targetMember) {
            generalFields.push(
                {
                    name: 'Joined Server:',
                    value: `🗓️ <t:${Math.floor(targetMember.joinedAt.getTime() / 1000)}:R>`,
                    inline: true
                },
                { name: '\u200b', value: '\u200b', inline: true } // Spacer
            );
        }

        // Add badges if the user has any
        if (badges) {
            generalFields.push({ name: 'Badges:', value: `🏆 ${badges}`, inline: false });
        }

        // Add roles if the user has any in this guild
        if (targetMember && targetMember.roles.cache.size > 1) {
            const roles = targetMember.roles.cache
                .filter(role => role.id !== interaction.guild.roles.everyone.id)
                .sort((a, b) => b.position - a.position)
                .map(role => role.toString());

            generalFields.push({
                name: `Roles [${roles.length}]`,
                value: roles.join(' '),
                inline: false
            });
        }

        // ====================================================================
        //                       Statistics Section
        // ====================================================================
        const statisticsFields = [
            // Section header
            { name: '\u200b', value: '\u200b', inline: false }, // Spacer
            { name: '**__- Statistics:__**', value: '\u200b', inline: false },
            { name: 'Is Bot?', value: targetUser.bot ? '🤖 Yes' : '👤 No', inline: true },
        ];

        // Add more stats if the user is in the guild
        if (targetMember) {
            const statusEmojis = { 'online': '🟢', 'idle': '🟡', 'dnd': '🔴', 'offline': '⚫' };
            const status = targetMember.presence?.status || 'offline';
            const statusText = status.charAt(0).toUpperCase() + status.slice(1);

            statisticsFields.push(
                { name: 'Status:', value: `${statusEmojis[status]} ${statusText}`, inline: true }
            );
        }

        // Combine and add all fields to the embed
        userInfoEmbed.addFields(...generalFields, ...statisticsFields);

        // Reply with the final embed
        await interaction.editReply({ embeds: [userInfoEmbed] });
    },
};
