/**
 * Clear Command
 * Bulk delete messages from a channel
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { CustomEmbedBuilder, THEME } = require('../utils/embedBuilder');

module.exports = {
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

        // Check if bot has required permissions
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
            const errorEmbed = embedBuilder.error(
                'Missing Permissions',
                'I need the **Manage Messages** permission to delete messages.'
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        // Check if user has required permissions
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            const errorEmbed = embedBuilder.error(
                'Insufficient Permissions',
                'You need the **Manage Messages** permission to use this command.'
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        try {
            // Show loading message
            const loadingEmbed = embedBuilder.loading(
                'Clearing Messages...',
                `Deleting ${amount} message${amount === 1 ? '' : 's'}${targetUser ? ` from ${targetUser.username}` : ''}...`
            );

            await interaction.reply({ embeds: [loadingEmbed], ephemeral: true });

            // Fetch messages to delete
            let messagesToDelete;
            
            if (targetUser) {
                // Fetch more messages to filter by user
                const fetchLimit = Math.min(amount * 3, 100); // Fetch more to account for filtering
                const fetched = await interaction.channel.messages.fetch({ limit: fetchLimit });
                
                // Filter messages by target user
                messagesToDelete = fetched.filter(msg => 
                    msg.author.id === targetUser.id && 
                    Date.now() - msg.createdTimestamp < 14 * 24 * 60 * 60 * 1000 // Less than 14 days old
                );

                // Limit to requested amount
                messagesToDelete = messagesToDelete.first(amount);
            } else {
                // Fetch messages normally
                messagesToDelete = await interaction.channel.messages.fetch({ limit: amount });
                
                // Filter out messages older than 14 days (Discord API limitation)
                messagesToDelete = messagesToDelete.filter(msg => 
                    Date.now() - msg.createdTimestamp < 14 * 24 * 60 * 60 * 1000
                );
            }

            if (messagesToDelete.size === 0) {
                const noMessagesEmbed = embedBuilder.warning(
                    'No Messages Found',
                    targetUser 
                        ? `No recent messages found from ${targetUser.username} in this channel.`
                        : 'No messages found to delete. Messages older than 14 days cannot be bulk deleted.'
                );
                return interaction.editReply({ embeds: [noMessagesEmbed] });
            }

            // Delete messages
            let deletedCount = 0;
            
            if (messagesToDelete.size === 1) {
                // Single message deletion
                await messagesToDelete.first().delete();
                deletedCount = 1;
            } else {
                // Bulk delete
                const deleted = await interaction.channel.bulkDelete(messagesToDelete, true);
                deletedCount = deleted.size;
            }

            // Success response
            const successEmbed = embedBuilder.success(
                'Messages Cleared!',
                `Successfully deleted **${deletedCount}** message${deletedCount === 1 ? '' : 's'}${targetUser ? ` from ${targetUser.username}` : ''}.`,
                [
                    {
                        name: '📊 Details',
                        value: [
                            `**Channel:** ${interaction.channel}`,
                            `**Moderator:** ${interaction.user}`,
                            `**Reason:** ${reason}`,
                            targetUser ? `**Target User:** ${targetUser}` : null
                        ].filter(Boolean).join('\n'),
                        inline: false
                    }
                ]
            );

            await interaction.editReply({ embeds: [successEmbed] });

            // Log to console
            console.log(`🗑️ [CLEAR] ${interaction.user.tag} deleted ${deletedCount} messages in #${interaction.channel.name}${targetUser ? ` from ${targetUser.tag}` : ''}`);

            // Optional: Send a brief confirmation message that auto-deletes
            const confirmMessage = await interaction.followUp({
                content: `✅ Cleared ${deletedCount} message${deletedCount === 1 ? '' : 's'}.`,
                ephemeral: false
            });

            // Delete the confirmation message after 5 seconds
            setTimeout(async () => {
                try {
                    await confirmMessage.delete();
                } catch (error) {
                    // Message might already be deleted, ignore error
                }
            }, 5000);

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