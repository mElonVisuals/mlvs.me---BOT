/**
 * Guild Member Remove Event Handler
 * Fires when a user leaves the server, sending a goodbye message.
 */

const { Events } = require('discord.js');
const { CustomEmbedBuilder } = require('../utils/embedBuilder');

module.exports = {
    // The event name is GuildMemberRemove, which triggers when a user leaves.
    name: Events.GuildMemberRemove,
    once: false,
    async execute(member) {
        const embedBuilder = new CustomEmbedBuilder(member.client);

        // --- Configuration ---
        const welcomeChannelId = '1401618792798224434';
        const goodbyeChannel = member.guild.channels.cache.get(welcomeChannelId);

        // If the channel isn't found, log an error and stop.
        if (!goodbyeChannel) {
            console.error(`❌ Channel with ID ${welcomeChannelId} not found for goodbye message.`);
            return;
        }

        // Build the goodbye embed using the custom embed builder.
        const goodbyeEmbed = embedBuilder.info(
            `Goodbye, ${member.user.username}!`,
            `We're sad to see you go. The server now has ${member.guild.memberCount} members.`
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }));

        try {
            // Send the goodbye embed to the designated channel.
            await goodbyeChannel.send({ embeds: [goodbyeEmbed] });
        } catch (error) {
            console.error(`❌ Error sending goodbye message: ${error.message}`);
        }
    },
};
