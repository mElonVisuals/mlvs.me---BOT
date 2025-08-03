// src/commands/clear.js

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { CustomEmbedBuilder, THEME } = require('../utils/embedBuilder');

module.exports = {
    // Add a category property
    category: 'Moderation',

    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Delete a specified number of messages from the channel')
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Number of messages to delete (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        )
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('Delete messages only from this user')
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for clearing messages')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder(interaction.client);
        const amount = interaction.options.getInteger('amount');
        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            // Defer the reply to prevent a timeout
            await interaction.deferReply({ ephemeral: true });

            let messages;
            if (targetUser) {
                // Fetch messages and filter by target user
                messages = await interaction.channel.messages.fetch({ limit: 100 });
                const userMessages = messages.filter(m => m.author.id === targetUser.id).first(amount);

                if (userMessages.length === 0) {
                    const noMessagesEmbed = embedBuilder.warning(
                        'No Messages Found',
                        `I couldn't find any recent messages from <@${targetUser.id}> in this channel.`
                    );
                    return interaction.editReply({ embeds: [noMessagesEmbed] });
                }

                await interaction.channel.bulkDelete(userMessages, true);
            } else {
                // Bulk delete messages
                await interaction.channel.bulkDelete(amount, true);
            }
            
            const successEmbed = embedBuilder.success(
                'Messages Cleared!',
                `Successfully deleted **${amount}** messages${targetUser ? ` from <@${targetUser.id}>` : ''}.`
            ).addFields(
                { name: 'Reason', value: `\`\`\`${reason}\`\`\`` }
            );

            await interaction.editReply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('❌ Error in clear command:', error);

            let errorMessage = 'An error occurred while trying to delete messages.';
            
            if (error.code === 50034) {
                errorMessage = 'Cannot delete messages older than 14 days due to Discord limitations.';
            } else if (error.code === 50013) {
                errorMessage = 'Missing permissions to delete messages in this channel.';
            } else if (error.code === 50035) {
                errorMessage = 'Invalid form body. Please check your input values.';
            }

            const errorEmbed = embedBuilder.error(
                'Clear Failed',
                errorMessage,
                [
                    {
                        name: '🔧 Error Code',
                        value: `\`${error.code || 'Unknown'}\``,
                        inline: true
                    },
                    {
                        name: '💡 Tip',
                        value: 'Make sure the bot has **Manage Messages** permission and try with fewer messages.',
                        inline: false
                    }
                ]
            );

            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};
