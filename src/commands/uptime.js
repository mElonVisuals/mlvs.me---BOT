/**
 * This is the uptime.js command file.
 * It's designed to work with a Discord bot using discord.js v14 and slash commands.
 * This command displays how long the bot has been online in a human-readable format.
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const formatUptime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const parts = [];

    if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours % 24} hour${hours % 24 !== 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes % 60} minute${minutes % 60 !== 1 ? 's' : ''}`);
    if (seconds > 0) parts.push(`${seconds % 60} second${seconds % 60 !== 1 ? 's' : ''}`);

    if (parts.length === 0) return 'Less than a second';
    if (parts.length > 1) {
        const lastPart = parts.pop();
        return `${parts.join(', ')} and ${lastPart}`;
    }

    return parts[0];
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Shows how long the bot has been online.'),

    async execute(interaction) {
        // We can send a direct reply as this calculation is fast.
        const uptimeInMs = interaction.client.uptime;
        const formattedUptime = formatUptime(uptimeInMs);

        const uptimeEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('Bot Uptime ⏱️')
            .setDescription(`I've been online for **${formattedUptime}**.`)
            .setTimestamp()
            .setFooter({ text: 'Bot Information' });

        // A quick note about your warning: `ephemeral: true` is deprecated in favor of `flags`.
        // The `interactionCreate.js` file above shows an example of using it correctly with `.reply()`.
        await interaction.reply({ embeds: [uptimeEmbed] });
    },
};
