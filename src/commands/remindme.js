// src/commands/remindme.js
const { SlashCommandBuilder } = require('discord.js');
const { CustomEmbedBuilder, THEME } = require('../utils/embedBuilder');
const { saveReminder, checkReminderStatus } = require('../utils/database');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remindme')
        .setDescription('Sets a reminder for yourself.')
        .addStringOption(option =>
            option.setName('time')
                .setDescription('How long from now? (e.g., 10s, 5m, 1h, 3d)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('What do you want to be reminded about?')
                .setRequired(true)),
    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder(interaction.client);
        await interaction.deferReply({ ephemeral: true });

        const timeString = interaction.options.getString('time');
        const reminderMessage = interaction.options.getString('message');
        const userId = interaction.user.id;
        const channelId = interaction.channel.id;

        const timeInMs = ms(timeString);

        if (!timeInMs || timeInMs < 5000) {
            const errorEmbed = embedBuilder.error(
                'Invalid Time',
                `Please provide a valid time greater than 5 seconds.`
            );
            return await interaction.editReply({ embeds: [errorEmbed] });
        }

        const reminderTimestamp = Date.now() + timeInMs;

        try {
            // Save the reminder to the database
            const reminder = {
                userId,
                channelId,
                message: reminderMessage,
                timestamp: reminderTimestamp
            };
            await saveReminder(userId, channelId, reminderMessage, reminderTimestamp);

            // Schedule the reminder using the utility function
            checkReminderStatus(interaction.client, reminder);

            // Create and send a success embed
            const successEmbed = embedBuilder.success(
                'Reminder Set!',
                `I will remind you <t:${Math.floor(reminderTimestamp / 1000)}:R> in this channel.`
            ).addFields(
                { name: 'Your Reminder', value: `\`\`\`${reminderMessage}\`\`\`` }
            );

            await interaction.editReply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('❌ Error saving reminder to database:', error);
            const errorEmbed = embedBuilder.error(
                'Reminder Failed',
                `An error occurred while setting your reminder. Please try again later.`
            );
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};
