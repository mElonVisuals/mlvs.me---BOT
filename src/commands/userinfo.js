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

        // Get the target user from the command options, or the command author if no user is specified.
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const targetMember = interaction.guild.members.cache.get(targetUser.id);

        // Fetch the full user to get their banner, which is not available on the base user object
        let fullUser = targetUser;
        try {
            fullUser = await interaction.client.users.fetch(targetUser.id, { force: true, cache: false });
        } catch (error) {
            console.error('Could not fetch full user data:', error.message);
        }

        // Create the new embed
        const userInfoEmbed = new EmbedBuilder()
            // Set a consistent color for the embed
            .setColor(0x5865F2) // Discord's blurple color
            .setTitle(`User Info - ${fullUser.username}`)
            // Use the target's server avatar for the thumbnail if they have one, otherwise use their global avatar
            .setThumbnail(targetMember?.displayAvatarURL({ dynamic: true, size: 1024 }) || fullUser.displayAvatarURL({ dynamic: true, size: 1024 }))
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
                { name: 'Highest Role:', value: `${highestRole}`, inline: true }
            );
        }

        // ====================================================================
        //                       Avatar Section (Replaces Badges)
        // ====================================================================
        userInfoEmbed.addFields({
            name: '\u200b', // Spacer for a new line
            value: '\u200b',
            inline: false
        }, {
            name: '🖼️ Avatars:',
            value: `**Global Avatar:** [Link](${fullUser.displayAvatarURL({ dynamic: true, size: 1024 })})\n` +
                   `**Server Avatar:** [Link](${targetMember?.displayAvatarURL({ dynamic: true, size: 1024 }) || 'None'})`,
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
                name: '\u200b', // Spacer for a new line
                value: '\u200b',
                inline: false
            }, {
                name: `Roles [${roles.length}]`,
                value: roles.join(', '),
                inline: false
            });
        }
        
        // Add the user's banner as the image if it exists
        if (fullUser.banner) {
            userInfoEmbed.setImage(fullUser.bannerURL({ dynamic: true, size: 1024 }));
        }

        // Edit the deferred reply with the final embed
        await interaction.editReply({ embeds: [userInfoEmbed] });
    },
};
