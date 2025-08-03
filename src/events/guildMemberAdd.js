/**
 * Guild Member Add Event Handler
 * Fires when a new user joins the server, sending a welcome message.
 */

const { Events } = require('discord.js');
const { CustomEmbedBuilder } = require('../utils/embedBuilder');

module.exports = {
    // The event name is GuildMemberAdd, which triggers when a new user joins.
    name: Events.GuildMemberAdd,
    once: false,
    async execute(member) {
        // Instantiate CustomEmbedBuilder to create a themed embed.
        const embedBuilder = new CustomEmbedBuilder(member.client);

        // --- Configuration ---
        // Hardcoded channel IDs and image URLs. These should be stored in a config or database for production.
        const welcomeChannelId = '1401618741157953656';
        const rulesChannelId = '1399901990800326806';
        const imageUrl = 'https://cdn.discordapp.com/attachments/1335734480253747297/1401617852712353894/welcome.png?ex=6890edd8&is=688f9c58&hm=3419e0ce180dde7607bf4e93457b1587560b40d2cf44326459ce34aa337a7022&';
        const footerIconUrl = 'https://cdn.discordapp.com/attachments/1335734480253747297/1400244688061202553/mlvs.me-logo.png?ex=68908c3c&is=688f3abc&hm=f85d565a9822ddf01ea64f44d015f8815e22d6cfee5f0e71aa4720b229cfa3be&';

        // Find the welcome channel using the configured ID.
        const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);

        // If the channel isn't found, log an error and stop execution.
        if (!welcomeChannel) {
            console.error(`❌ Channel with ID ${welcomeChannelId} not found.`);
            return;
        }

        // Build the welcome embed using the custom embed builder.
        // The `info` embed type provides a themed blue color.
        const welcomeEmbed = embedBuilder.info(
            `Welcome to the server, ${member.user.username}!`,
            `Please visit <#${rulesChannelId}> to get verified and join the fun! Let's hit the track! 🏁`
        )
        // Add the image and thumbnail
        .setImage(imageUrl)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        // Add a footer with text and the icon URL.
        .setFooter({ text: 'Fx-Drift Team', iconURL: footerIconUrl });
    
        try {
            // Send the welcome embed to the designated channel.
            await welcomeChannel.send({
                content: `Welcome <@${member.id}>!`, // Mentions the new member
                embeds: [welcomeEmbed]
            });
        } catch (error) {
            console.error(`❌ Error sending welcome message: ${error.message}`);
        }
    },
};
