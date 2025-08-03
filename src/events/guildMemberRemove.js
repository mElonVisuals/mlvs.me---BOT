/**
 * Guild Member Remove Event Handler
 * Sends a goodbye message when a member leaves the server.
 */

const { Events } = require('discord.js');
const { CustomEmbedBuilder } = require('../utils/embedBuilder');
const { getGuildSetting } = require('../utils/database'); // New utility to handle database queries

module.exports = {
    name: Events.GuildMemberRemove,
    once: false,
    async execute(member) {
        const embedBuilder = new CustomEmbedBuilder(member.client);

        try {
            // Get the welcome channel and goodbye message from the database
            const welcomeChannelId = await getGuildSetting(member.guild.id, 'welcomeChannelId');
            const goodbyeMessageTemplate = await getGuildSetting(member.guild.id, 'goodbyeMessage');
            
            // If no goodbye channel or message is configured, do nothing
            if (!welcomeChannelId || !goodbyeMessageTemplate) return;

            const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
            
            if (!welcomeChannel) {
                console.warn(`⚠️ Goodbye channel not found for guild ${member.guild.id}.`);
                return;
            }

            // Replace placeholders in the message
            const goodbyeMessage = goodbyeMessageTemplate
                .replace(/{user}/g, member.user.tag)
                .replace(/{server}/g, member.guild.name);

            const goodbyeEmbed = embedBuilder.info(
                `Goodbye, ${member.user.tag}!`,
                goodbyeMessage
            ).setThumbnail(member.user.displayAvatarURL());

            await welcomeChannel.send({ embeds: [goodbyeEmbed] });

        } catch (error) {
            console.error(`❌ Error handling member remove event for guild ${member.guild.id}:`, error);
        }
    },
};
