// src/commands/remindme.js
const { SlashCommandBuilder } = require('discord.js');
const { CustomEmbedBuilder, THEME } = require('../utils/embedBuilder'); // Import the class and THEME
const ms = require('ms'); // You'll need to install this package: npm install ms

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
        // Create an instance of CustomEmbedBuilder for this interaction
        const embedBuilder = new CustomEmbedBuilder(interaction.client);

        await interaction.deferReply({ ephemeral: true }); // Defer and make it ephemeral

        const timeString = interaction.options.getString('time');
        const reminderMessage = interaction.options.getString('message');
        const userId = interaction.user.id;
        const channelId = interaction.channel.id;

        const timeInMs = ms(timeString);

        if (!timeInMs || timeInMs < 5000) { // Minimum 5 seconds
            const errorEmbed = embedBuilder.error(
                'Invalid Time',
                'Please provide a valid time (e.g., `10s`, `5m`, `1h`, `3d`). Minimum reminder time is 5 seconds.'
            );
            return interaction.editReply({ embeds: [errorEmbed] });
        }

        if (timeInMs > ms('30d')) { // Maximum 30 days to avoid too many long-running timers
            const errorEmbed = embedBuilder.error(
                'Time Limit Exceeded',
                'Reminders cannot be set for longer than 30 days.'
            );
            return interaction.editReply({ embeds: [errorEmbed] });
        }

        const reminderTimestamp = Math.floor((Date.now() + timeInMs) / 1000); // Unix timestamp for Discord formatting

        const successEmbed = embedBuilder.createBaseEmbed('success')
            .setTitle(`${THEME.emojis.success} Reminder Set!`)
            .setDescription(`I will remind you <t:${reminderTimestamp}:R> in this channel.`)
            .addFields(
                { name: 'Your Reminder', value: `\`\`\`${reminderMessage}\`\`\`` }
            );

        await interaction.editReply({ embeds: [successEmbed] });

        // Set the timeout for the reminder
        setTimeout(async () => {
            try {
                // Fetch the user and channel again to ensure they are still available
                const user = await interaction.client.users.fetch(userId);
                const channel = await interaction.client.channels.fetch(channelId);

                if (user && channel) {
                    const reminderEmbed = embedBuilder.createBaseEmbed('info')
                        .setTitle(`${THEME.emojis.info} Reminder!`)
                        .setDescription(`Hey ${user}! You asked me to remind you about:`)
                        .addFields(
                            { name: 'Your Message', value: `\`\`\`${reminderMessage}\`\`\`` }
                        )
                        .setTimestamp(); // Set timestamp to when the reminder fires

                    // Send the reminder message to the original channel
                    await channel.send({ content: `<@${userId}>`, embeds: [reminderEmbed] });
                }
            } catch (error) {
                console.error(`Error sending reminder to ${userId} in ${channelId}:`, error);
                // If the channel or user is gone, we can't send the reminder.
            }
        }, timeInMs);
    },
};