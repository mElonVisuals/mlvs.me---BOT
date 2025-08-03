/**
 * Guild Member Remove Event Handler
 * Fires when a user leaves the server, sending a goodbye message.
 */

const { Events } = require('discord.js');
const { CustomEmbedBuilder } = require('../utils/embedBuilder');
const { format } = require('date-fns'); // Import date-fns for date formatting

module.exports = {
    // The event name is GuildMemberRemove, which triggers when a user leaves.
    name: Events.GuildMemberRemove,
    once: false,
    async execute(member) {
        const embedBuilder = new CustomEmbedBuilder(member.client);

        // --- Configuration ---
        const welcomeChannelId = '1401618792798224434';
        const footerIconUrl = 'https://cdn.discordapp.com/attachments/1335734480253747297/1400244688061202553/mlvs.me-logo.png?ex=68908c3c&is=688f3abc&hm=f85d565a9822ddf01ea64f44d015f8815e22d6cfee5f0e71aa4720b229cfa3be&';
        const goodbyeChannel = member.guild.channels.cache.get(welcomeChannelId);

        // If the channel isn't found, log an error and stop.
        if (!goodbyeChannel) {
            console.error(`❌ Channel with ID ${welcomeChannelId} not found for goodbye message.`);
            return;
        }

        // Use date-fns to format dates
        const joinDate = member.joinedAt ? format(member.joinedAt, 'dd.MM.yyyy') : 'N/A';
        const accountCreatedDate = format(member.user.createdAt, 'dd.MM.yyyy');

        // Build the goodbye embed using the custom embed builder, mirroring the welcome embed style
        const goodbyeEmbed = embedBuilder.createBaseEmbed('info')
            .setTitle('👋 Goodbye!')
            .setDescription(`We're sad to see **${member.user.username}** go. The server now has **${member.guild.memberCount}** members.`)
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
            // Send the goodbye embed to the designated channel.
            await goodbyeChannel.send({ embeds: [goodbyeEmbed] });
        } catch (error) {
            console.error(`❌ Error sending goodbye message: ${error.message}`);
        }
    },
};
