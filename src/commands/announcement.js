/**
 * Announcement Command
 * Builds and sends a beautiful, customizable embed to a specified channel.
 */

const { SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const { CustomEmbedBuilder } = require('../utils/embedBuilder');

module.exports = {
    // Command data
    data: new SlashCommandBuilder()
        .setName('announcement')
        .setDescription('Sends a customizable announcement embed to a channel.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the announcement to.')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .addStringOption(option =>
            option.setName('title')
                .setDescription('The title for the announcement embed.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The main message for the announcement.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('image')
                .setDescription('An image URL to include in the announcement.')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('color')
                .setDescription('A hex color code (e.g., #FFFFFF) for the embed\'s sidebar.')
                .setRequired(false)),

    // Command execution logic
    async execute(interaction) {
        // Instantiate CustomEmbedBuilder just like in your serverinfo.js
        const embedBuilder = new CustomEmbedBuilder(interaction.client);
        
        // Defer the reply, making it ephemeral (only visible to the user who ran the command)
        await interaction.deferReply({ ephemeral: true });

        // Get the options provided by the user
        const targetChannel = interaction.options.getChannel('channel');
        const announcementTitle = interaction.options.getString('title');
        const announcementMessage = interaction.options.getString('message');
        const announcementImage = interaction.options.getString('image');
        const announcementColor = interaction.options.getString('color');

        try {
            // Check if the bot has permission to send messages to the target channel
            const channelPermissions = interaction.guild.members.me.permissionsIn(targetChannel);
            if (!channelPermissions.has(PermissionsBitField.Flags.SendMessages)) {
                const errorEmbed = embedBuilder.error(
                    'Permission Denied',
                    `I do not have permission to send messages in the ${targetChannel} channel.`
                );
                return interaction.editReply({ embeds: [errorEmbed] });
            }

            // Create the embed using the provided options
            const announcementEmbed = embedBuilder.createBaseEmbed('info')
                .setTitle(announcementTitle)
                .setDescription(announcementMessage);

            // Set the image if one was provided
            if (announcementImage) {
                announcementEmbed.setImage(announcementImage);
            }

            // Set the color if one was provided and it's a valid hex code
            if (announcementColor && /^#[0-9A-Fa-f]{6}$/.test(announcementColor)) {
                announcementEmbed.setColor(announcementColor);
            }

            // Send the embed to the chosen channel
            await targetChannel.send({ embeds: [announcementEmbed] });

            // Send a success message back to the user
            const successEmbed = embedBuilder.success(
                'Announcement Sent!',
                `Your announcement has been successfully sent to ${targetChannel}.`
            );
            await interaction.editReply({ embeds: [successEmbed] });

        } catch (error) {
            console.error(`Error sending announcement:`, error);
            const errorEmbed = embedBuilder.error(
                'Announcement Failed',
                `An unexpected error occurred while trying to send your announcement. Please check the logs for details.`
            );
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};
