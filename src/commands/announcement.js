// src/commands/announcement.js

const { SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const { CustomEmbedBuilder, THEME } = require('../utils/embedBuilder');

module.exports = {
    // Add a category property
    category: 'Moderation',

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
            option.setName('thumbnail')
                .setDescription('A thumbnail image URL to show in the announcement.')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('color')
                .setDescription('A hex color code for the embed (#FF5733).')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('pingeveryone')
                .setDescription('Ping @everyone with the announcement?')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('footer')
                .setDescription('A custom footer message for the announcement.')
                .setRequired(false)),

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder(interaction.client);

        await interaction.deferReply({ ephemeral: true });

        const targetChannel = interaction.options.getChannel('channel');
        const announcementTitle = interaction.options.getString('title');
        const announcementMessage = interaction.options.getString('message');
        const announcementImage = interaction.options.getString('image');
        const announcementThumbnail = interaction.options.getString('thumbnail');
        const announcementColor = interaction.options.getString('color');
        const pingEveryone = interaction.options.getBoolean('pingeveryone') || false;
        const announcementFooterText = interaction.options.getString('footer');

        try {
            const announcementEmbed = embedBuilder.createBaseEmbed()
                .setTitle(announcementTitle)
                .setDescription(announcementMessage);

            if (announcementImage) announcementEmbed.setImage(announcementImage);
            if (announcementThumbnail) announcementEmbed.setThumbnail(announcementThumbnail);

            const hexColorRegex = /^#([0-9A-F]{3}){1,2}$/i;
            if (announcementColor && hexColorRegex.test(announcementColor)) {
                announcementEmbed.setColor(announcementColor);
            } else {
                announcementEmbed.setColor('#FFD700'); // Gold
            }

            const footerText = announcementFooterText ? `📌 ${announcementFooterText}` : `📌 Sent by the bot team`;
            announcementEmbed.setFooter({ text: footerText });
            announcementEmbed.setTimestamp();

            const content = pingEveryone ? '@everyone' : null;
            await targetChannel.send({ content, embeds: [announcementEmbed] });

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
