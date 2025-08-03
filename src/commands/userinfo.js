/**
 * User Info Command
 * Displays detailed information about a Discord user
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    // Add a category property for organization
    category: 'Information',

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

        // Fetch the full user to get flags/badges and banner
        let fullUser = targetUser;
        try {
            // Force fetch with cache bypass to get all user data including flags and banner
            fullUser = await interaction.client.users.fetch(targetUser.id, { force: true, cache: false });
        } catch (error) {
            console.error('Could not fetch full user data:', error.message);
        }

        // Create the new embed
        const userInfoEmbed = new EmbedBuilder()
            // Set the color, title, and thumbnail
            .setColor(0x2b2d31) // A dark, Discord-like gray
            .setTitle(`User Info - ${fullUser.username}`)
            .setThumbnail(fullUser.displayAvatarURL({ dynamic: true, size: 1024 }))
            // Add a timestamp and footer
            .setTimestamp()
            .setFooter({
                text: `${interaction.guild.name}`,
                iconURL: interaction.guild.iconURL()
            });

        // ====================================================================
        //                       General Section
        // ====================================================================
        // Add fields for General Info
        userInfoEmbed.addFields(
            { name: '**__- General:__**', value: '\u200b', inline: false },
            { name: 'Username:', value: `${fullUser.username}`, inline: true },
            { name: 'ID:', value: `\`${fullUser.id}\``, inline: true }
        );

        // ====================================================================
        //                       Server Stats Section
        // ====================================================================
        // Only show server stats if the user is in the guild
        if (targetMember) {
            // Get the highest role the user has
            const highestRole = targetMember.roles.highest.id === interaction.guild.id ? 'None' : targetMember.roles.highest;
            
            userInfoEmbed.addFields(
                { name: '\u200b', value: '\u200b', inline: false },
                { name: '**__- Server Stats:__**', value: '\u200b', inline: false },
                { name: 'Nickname:', value: `${targetMember.nickname || 'None'}`, inline: true },
                { name: 'Joined Server:', value: `🗓️ <t:${Math.floor(targetMember.joinedAt.getTime() / 1000)}:R>`, inline: true },
                { name: 'Highest Role:', value: `${highestRole}`, inline: true },
                { name: 'Total Roles:', value: `${targetMember.roles.cache.size - 1}`, inline: true },
                { name: 'Account Created:', value: `🗓️ <t:${Math.floor(fullUser.createdAt.getTime() / 1000)}:R>`, inline: true }
            );
        } else {
            // If the user is not in the guild, just show account creation date
            userInfoEmbed.addFields(
                { name: '\u200b', value: '\u200b', inline: false },
                { name: 'Account Created:', value: `🗓️ <t:${Math.floor(fullUser.createdAt.getTime() / 1000)}:R>`, inline: false }
            );
        }

        // ====================================================================
        //                       Badges Section
        // ====================================================================
        // Check if the user has any flags/badges
        const rawBadges = fullUser.flags ? fullUser.flags.toArray() : [];
        const badges = rawBadges.length > 0 ?
            rawBadges.map(flag => {
                // Map the flag names to official Discord badge emojis for a better look
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
                    case 'VerifiedBot': return 'Verified Bot';
                    case 'VerifiedDeveloper': return 'Verified Developer';
                    case 'ActiveDeveloper': return 'Active Developer';
                    default: return flag;
                }
            }).join(', ') :
            'None';

        userInfoEmbed.addFields({
            name: '\u200b', // Spacer for a new line
            value: '\u200b',
            inline: false
        }, {
            name: '🏆 Badges:',
            value: badges,
            inline: false
        });
        
        // ====================================================================
        //                       Roles Section
        // ====================================================================
        // Add roles if the user has any in this guild
        if (targetMember && targetMember.roles.cache.size > 1) {
            const roles = targetMember.roles.cache
                .filter(role => role.id !== interaction.guild.roles.everyone.id)
                .sort((a, b) => b.position - a.position)
                .map(role => role.toString());

            userInfoEmbed.addFields({
                name: `Roles [${roles.length}]`,
                value: roles.join(', '),
                inline: false
            });
        }
        
        // Add the user's banner as the image if it exists
        if (fullUser.banner) {
            userInfoEmbed.setImage(fullUser.bannerURL({ dynamic: true, size: 1024 }));
        }

        // Reply with the final embed
        await interaction.editReply({ embeds: [userInfoEmbed] });
    },
};
