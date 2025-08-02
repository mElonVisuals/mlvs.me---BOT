/**
 * AFK Command
 * Set AFK status with custom message and auto-responses
 */

const { SlashCommandBuilder } = require('discord.js');
const { CustomEmbedBuilder, THEME } = require('../utils/embedBuilder');

// Store AFK users in memory (use database in production for persistence)
const afkUsers = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Set your AFK status with an optional message')
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('Optional AFK message (max 200 characters)')
                .setRequired(false)
                .setMaxLength(200)
        ),

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder(interaction.client);
        const afkMessage = interaction.options.getString('message') || 'AFK';
        const userId = interaction.user.id;

        // Check if user is already AFK
        if (afkUsers.has(userId)) {
            // Remove AFK status
            const userData = afkUsers.get(userId);
            afkUsers.delete(userId);

            const returnEmbed = embedBuilder.success(
                'Welcome Back!',
                `You're no longer AFK. You were away for **${formatDuration(Date.now() - userData.timestamp)}**.`,
                [
                    {
                        name: '📝 Previous AFK Message',
                        value: userData.message,
                        inline: false
                    }
                ]
            );

            await interaction.reply({ embeds: [returnEmbed], ephemeral: true });
        } else {
            // Set AFK status
            afkUsers.set(userId, {
                message: afkMessage,
                timestamp: Date.now(),
                username: interaction.user.username
            });

            const afkEmbed = embedBuilder.info(
                'AFK Status Set',
                `You're now marked as AFK. I'll notify others when they mention you.`,
                [
                    {
                        name: '💤 AFK Message',
                        value: afkMessage,
                        inline: false
                    },
                    {
                        name: '🔔 How it works',
                        value: 'When someone mentions you, I\'ll let them know you\'re AFK. Use `/afk` again to remove your AFK status.',
                        inline: false
                    }
                ]
            );

            await interaction.reply({ embeds: [afkEmbed], ephemeral: true });
        }
    },

    // Function to handle AFK mentions (called from message events)
    handleMention(message, mentionedUser) {
        if (afkUsers.has(mentionedUser.id)) {
            const userData = afkUsers.get(mentionedUser.id);
            const afkDuration = formatDuration(Date.now() - userData.timestamp);

            const embedBuilder = new CustomEmbedBuilder(message.client);
            const afkNotice = embedBuilder.warning(
                `${mentionedUser.username} is AFK`,
                `**Message:** ${userData.message}\n**Duration:** ${afkDuration}`,
                [
                    {
                        name: '💡 Tip',
                        value: 'They will be notified when they return and send a message.',
                        inline: false
                    }
                ]
            );

            message.reply({ embeds: [afkNotice] }).catch(() => {
                // Ignore errors if we can't reply (permissions, etc.)
            });
        }
    },

    // Function to check if user returned from AFK
    checkReturn(message) {
        const userId = message.author.id;
        if (afkUsers.has(userId)) {
            const userData = afkUsers.get(userId);
            const afkDuration = formatDuration(Date.now() - userData.timestamp);
            afkUsers.delete(userId);

            const embedBuilder = new CustomEmbedBuilder(message.client);
            const returnEmbed = embedBuilder.success(
                'Welcome Back!',
                `You're no longer AFK after **${afkDuration}**.`
            );

            message.reply({ embeds: [returnEmbed] }).catch(() => {
                // Ignore errors if we can't reply
            });
        }
    },

    // Export the AFK users map for access from other files
    getAfkUsers: () => afkUsers
};

// Helper function to format duration
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}