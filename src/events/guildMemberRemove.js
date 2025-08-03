/**
 * Guild Member Remove Event Handler
 * This script sends a goodbye message when a user leaves the server.
 */
const { Events } = require('discord.js');
const { CustomEmbedBuilder } = require('../utils/embedBuilder');

module.exports = {
    name: Events.GuildMemberRemove,
    once: false,
    async execute(member) {
        const embedBuilder = new CustomEmbedBuilder(member.client);

        // --- Configuration ---
        // REPLACE THIS WITH YOUR ACTUAL GOODBYE CHANNEL ID
        const goodbyeChannelId = '1401618792798224434'; 
        const footerIconUrl = 'https://cdn.discordapp.com/attachments/1335734480253747297/1400244688061202553/mlvs.me-logo.png?ex=68908c3c&is=688f3abc&hm=f85d565a9822ddf01ea64f44d015f8815e22d6cfee5f0e71aa4720b229cfa3be&';

        const goodbyeChannel = member.guild.channels.cache.get(goodbyeChannelId);

        if (!goodbyeChannel) {
            console.error(`❌ Channel with ID ${goodbyeChannelId} not found.`);
            return;
        }

        const leaveEmbed = embedBuilder.createBaseEmbed('info')
            .setTitle(`A member has left the team! 👋`)
            .setDescription(`Goodbye, ${member.user.username}! We hope to see you again soon.`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: 'mlvs.me ・﹕TEAM', iconURL: footerIconUrl });

        try {
            await goodbyeChannel.send({ embeds: [leaveEmbed] });
        } catch (error) {
            console.error(`❌ Error sending goodbye message: ${error.message}`);
        }
    },
};
