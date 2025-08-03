// src/commands/remindme.js

const { SlashCommandBuilder } = require('discord.js');
const { CustomEmbedBuilder, THEME } = require('../utils/embedBuilder');
const ms = require('ms');

module.exports = {
    // Add a category property
    category: 'General',

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
                'Please provide a valid time greater than 5 seconds (e.g., `10s`, `5m`, `1h`).'
            );
            await interaction.editReply({ embeds: [errorEmbed] });
            return;
        }

        const reminderTimestamp = Math.floor((Date.now() + timeInMs) / 1000);

        const successEmbed = embedBuilder.success(
            'Reminder Set!',
            `I will remind you <t:${reminderTimestamp}:R> in this channel.`
        ).addFields(
            { name: 'Your Reminder', value: `\`\`\`${reminderMessage}\`\`\`` }
        );

        await interaction.editReply({ embeds: [successEmbed] });

        setTimeout(async () => {
            try {
                const user = await interaction.client.users.fetch(userId);
                const channel = await interaction.client.channels.fetch(channelId);

                if (user && channel) {
                    const reminderEmbed = embedBuilder.info(
                        'Reminder!',
                        `Hey ${user}! You asked me to remind you about:`
                    ).addFields(
                        { name: 'Your Message', value: `\`\`\`${reminderMessage}\`\`\`` }
                    );

                    await channel.send({ content: `<@${userId}>`, embeds: [reminderEmbed] });
                }
            } catch (error) {
                console.error(`Error sending reminder to ${userId} in ${channelId}:`, error);
            }
        }, timeInMs);
    },
};
