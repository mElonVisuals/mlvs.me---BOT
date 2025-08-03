/**
 * Set Welcome/Goodbye Command
 * Allows server administrators to configure a welcome and goodbye system.
 * This command stores the settings in a MySQL database.
 */

const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { CustomEmbedBuilder, THEME } = require('../utils/embedBuilder');
const { setGuildSetting } = require('../utils/database'); // New utility to handle database queries

module.exports = {
    // Command data: defines the command name, description, and options.
    data: new SlashCommandBuilder()
        .setName('setwelcome')
        .setDescription('Configure the welcome and goodbye message and channel for this server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send welcome and goodbye messages.')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .addStringOption(option =>
            option.setName('welcome_message')
                .setDescription('The welcome message. Use {user} and {server} placeholders.')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('goodbye_message')
                .setDescription('The goodbye message. Use {user} and {server} placeholders.')
                .setRequired(false)),

    // The core logic for the command execution.
    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder(interaction.client);
        await interaction.deferReply({ ephemeral: true }); // Defer the reply so we can perform database operations

        const channel = interaction.options.getChannel('channel');
        const welcomeMessage = interaction.options.getString('welcome_message');
        const goodbyeMessage = interaction.options.getString('goodbye_message');
        const guildId = interaction.guild.id;

        // Check if at least one message is provided
        if (!welcomeMessage && !goodbyeMessage) {
            const errorEmbed = embedBuilder.warning(
                'Missing Messages',
                'You must provide at least a welcome or a goodbye message to configure the system.'
            );
            return interaction.editReply({ embeds: [errorEmbed] });
        }

        try {
            // Save the settings to the database
            await setGuildSetting(guildId, 'welcomeChannelId', channel.id);
            await setGuildSetting(guildId, 'welcomeMessage', welcomeMessage || null);
            await setGuildSetting(guildId, 'goodbyeMessage', goodbyeMessage || null);

            let description = `Welcome and goodbye messages have been configured to be sent in ${channel}.`;

            const successEmbed = embedBuilder.success(
                'Welcome System Configured',
                description,
                [
                    { name: 'Welcome Message', value: `\`\`\`${welcomeMessage || 'Not set'}\`\`\``, inline: false },
                    { name: 'Goodbye Message', value: `\`\`\`${goodbyeMessage || 'Not set'}\`\`\``, inline: false },
                ]
            );

            await interaction.editReply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('❌ Error setting welcome/goodbye configuration:', error);

            const errorEmbed = embedBuilder.error(
                'Database Error',
                'There was an issue saving your settings to the database. Please try again later.'
            );
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};
