/**
 * Guild Member Add Event Handler
 * This script sends a welcome message and assigns the unverified role to new users.
 */
const { Events } = require('discord.js');
const { CustomEmbedBuilder } = require('../utils/embedBuilder');
const { format } = require('date-fns');

module.exports = {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(member) {
        const embedBuilder = new CustomEmbedBuilder(member.client);
        
        // --- Configuration ---
        // REPLACE THIS WITH YOUR ACTUAL WELCOME CHANNEL ID
        const welcomeChannelId = '1401618741157953656'; 
        // REPLACE THIS WITH YOUR UNVERIFIED ROLE ID
        const unverifiedRoleId = '1401625907482984551';
        // ADD YOUR IMAGE URL HERE
        const imageUrl = 'https://cdn.discordapp.com/attachments/1369865705238954168/1401632511175557251/welcome2.png?ex=6890fb7f&is=688fa9ff&hm=c80ca708911256e0a20645f7147e8e2caf427a153d8543afecb954be552cee98&';
        const footerIconUrl = 'https://cdn.discordapp.com/attachments/1335734480253747297/1400244688061202553/mlvs.me-logo.png?ex=68908c3c&is=688f3abc&hm=f85d565a9822ddf01ea64f44d015f8815e22d6cfee5f0e71aa4720b229cfa3be&';

        const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);

        if (!welcomeChannel) {
            console.error(`❌ Channel with ID ${welcomeChannelId} not found.`);
            return;
        }

        // --- Assign the Unverified role ---
        try {
            const unverifiedRole = member.guild.roles.cache.get(unverifiedRoleId);
            if (unverifiedRole) {
                await member.roles.add(unverifiedRole);
                console.log(`✅ Assigned 'Unverified' role to ${member.user.tag}.`);
            } else {
                console.error(`❌ Role with ID ${unverifiedRoleId} not found. Could not assign role to ${member.user.tag}.`);
            }
        } catch (error) {
            console.error(`❌ Failed to assign 'Unverified' role to ${member.user.tag}: ${error.message}`);
        }
        
        // --- Send the welcome message ---
        const joinDate = format(member.joinedAt, 'dd.MM.yyyy');
        const accountCreatedDate = format(member.user.createdAt, 'dd.MM.yyyy');
        
        const welcomeEmbed = embedBuilder.createBaseEmbed('info')
            .setTitle(`A new member has joined the team! 🎉`)
            .setDescription(`Welcome, ${member}! You are our **${member.guild.memberCount}th** member!\nPlease follow the verification steps in the designated channel.`)
            .setAuthor({
                name: member.user.username,
                iconURL: member.user.displayAvatarURL({ dynamic: true })
            })
            // This line sets the thumbnail image to the new member's avatar.
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            // This line sets a large image at the bottom of the embed.
            .setImage(imageUrl)
            .addFields(
                { name: '🗓️ Date of Joining', value: `\`\`\`${joinDate}\`\`\``, inline: true },
                { name: '📌 Account Created', value: `\`\`\`${accountCreatedDate}\`\`\``, inline: true }
            )
            .setFooter({ text: 'mlvs.me ・﹕TEAM', iconURL: footerIconUrl });
    
        try {
            await welcomeChannel.send({
                content: `Welcome <@${member.id}>!`,
                embeds: [welcomeEmbed],
            });
        } catch (error) {
            console.error(`❌ Error sending welcome message: ${error.message}`);
        }
    },
};
