/**
 * Guild Member Add Event Handler
 * This script sends a welcome message when a user joins the server.
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
        const footerIconUrl = 'https://cdn.discordapp.com/attachments/1335734480253747297/1400244688061202553/mlvs.me-logo.png?ex=68908c3c&is=688f3abc&hm=f85d565a9822ddf01ea64f44d015f8815e22d6cfee5f0e71aa4720b229cfa3be&';

        const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);

        if (!welcomeChannel) {
            console.error(`❌ Channel with ID ${welcomeChannelId} not found.`);
            return;
        }

        const joinDate = format(member.joinedAt, 'dd.MM.yyyy');
        const accountCreatedDate = format(member.user.createdAt, 'dd.MM.yyyy');
        
        const welcomeEmbed = embedBuilder.createBaseEmbed('info')
            .setTitle(`A new member has joined the team! 🎉`)
            .setDescription(`Welcome, ${member}! You are our **${member.guild.memberCount}th** member!\nPlease follow the verification steps in the designated channel.`)
            .setAuthor({
                name: member.user.username,
                iconURL: member.user.displayAvatarURL({ dynamic: true })
            })
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
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
