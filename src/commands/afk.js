/**
 * AFK Command
 * Set AFK status with custom message and auto-responses using a MySQL database.
 */

const { SlashCommandBuilder } = require('discord.js');
const { CustomEmbedBuilder } = require('../utils/embedBuilder');
const { query } = require('../utils/database');

module.exports = {
     category: 'Utility',
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

        await interaction.deferReply({ ephemeral: true });

        try {
            // Check if user is already AFK by querying the database
            const existingAfk = await query('SELECT * FROM afk_users WHERE user_id = ?', [userId]);

            if (existingAfk.length > 0) {
                // If the user is already AFK, remove their status
                await query('DELETE FROM afk_users WHERE user_id = ?', [userId]);

                const userData = existingAfk[0];
                const afkDuration = formatDuration(Date.now() - Number(userData.timestamp));

                const returnEmbed = embedBuilder.success(
                    'Welcome Back!',
                    `You're no longer AFK. You were away for **${afkDuration}**.`
                );
                await interaction.editReply({ embeds: [returnEmbed] });
            } else {
                // Set AFK status in the database
                const timestamp = Date.now();
                await query('INSERT INTO afk_users (user_id, message, timestamp) VALUES (?, ?, ?)', [userId, afkMessage, timestamp]);

                const setAfkEmbed = embedBuilder.info(
                    'You are now AFK',
                    `I will let people know you are AFK with the message: \`\`\`${afkMessage}\`\`\``
                );
                await interaction.editReply({ embeds: [setAfkEmbed] });
            }
        } catch (error) {
            console.error('❌ Error handling AFK command:', error);
            const errorEmbed = embedBuilder.error(
                'AFK Command Failed',
                'There was an error processing your request. Please try again later.'
            );
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },

    // Function to check for AFK mentions (will be used in messageCreate.js)
    async handleMention(message, mentionedUser) {
        try {
            const afkUser = await query('SELECT * FROM afk_users WHERE user_id = ?', [mentionedUser.id]);
            if (afkUser.length > 0) {
                const userData = afkUser[0];
                const afkDuration = formatDuration(Date.now() - Number(userData.timestamp));
                const embedBuilder = new CustomEmbedBuilder(message.client);
                const afkNotice = embedBuilder.info(
                    `User is AFK`,
                    `\`\`\`${mentionedUser.username}\`\`\` has been AFK for **${afkDuration}** with the message: \`\`\`${userData.message}\`\`\``
                );
                message.reply({ embeds: [afkNotice] }).catch(() => {});
            }
        } catch (error) {
            console.error('❌ Error handling AFK mention:', error);
        }
    },

    // Function to check if user returned from AFK
    async checkReturn(message) {
        const userId = message.author.id;
        try {
            const afkUser = await query('SELECT * FROM afk_users WHERE user_id = ?', [userId]);
            if (afkUser.length > 0) {
                await query('DELETE FROM afk_users WHERE user_id = ?', [userId]);

                const userData = afkUser[0];
                const afkDuration = formatDuration(Date.now() - Number(userData.timestamp));
                const embedBuilder = new CustomEmbedBuilder(message.client);
                const returnEmbed = embedBuilder.success(
                    'Welcome Back!',
                    `You're no longer AFK after **${afkDuration}**.`
                );
                message.reply({ embeds: [returnEmbed] }).catch(() => {});
            }
        } catch (error) {
            console.error('❌ Error checking for AFK return:', error);
        }
    }
};

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}
