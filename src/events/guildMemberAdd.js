/**
 * Guild Member Add Event Handler
 * Sends a welcome message when a new member joins the server.
 */

const { Events } = require('discord.js');
const { CustomEmbedBuilder } = require('../utils/embedBuilder');
const { getGuildSetting } = require('../utils/database'); // New utility to handle database queries

module.exports = {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(member) {
        const embedBuilder = new CustomEmbedBuilder(member.client);

        try {
            // Get the welcome channel and message from the database
            const welcomeChannelId = await getGuildSetting(member.guild.id, 'welcomeChannelId');
            const welcomeMessageTemplate = await getGuildSetting(member.guild.id, 'welcomeMessage');

            // If no welcome channel or message is configured, do nothing
            if (!welcomeChannelId || !welcomeMessageTemplate) return;

            const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);

            if (!welcomeChannel) {
                console.warn(`⚠️ Welcome channel not found for guild ${member.guild.id}.`);
                return;
            }

            // Replace placeholders in the message
            const welcomeMessage = welcomeMessageTemplate
                .replace(/{user}/g, `<@${member.id}>`)
                .replace(/{server}/g, member.guild.name);

            const welcomeEmbed = embedBuilder.info(
                `Welcome to ${member.guild.name}!`,
                welcomeMessage
            ).setThumbnail(member.user.displayAvatarURL());

            await welcomeChannel.send({ embeds: [welcomeEmbed] });

        } catch (error) {
            console.error(`❌ Error handling member add event for guild ${member.guild.id}:`, error);
        }
    },
};
