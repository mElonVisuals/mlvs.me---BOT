const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Get information about the bot'),
    
    async execute(interaction) {
        try {
            const client = interaction.client;
            const uptime = process.uptime();
            
            const embed = new EmbedBuilder()
                .setTitle('Bot Information')
                .setDescription(`Information about ${client.user.tag}`)
                .addFields(
                    { name: 'Bot Tag', value: client.user.tag, inline: true },
                    { name: 'Bot ID', value: client.user.id, inline: true },
                    { name: 'Servers', value: client.guilds.cache.size.toString(), inline: true },
                    { name: 'Uptime', value: formatUptime(uptime), inline: true }
                )
                .setThumbnail(client.user.displayAvatarURL())
                .setColor(0x00AE86)
                .setTimestamp();

            // Use editReply for deferred commands
            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            console.error('[ERROR] Failed to execute botinfo command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription('Failed to retrieve bot information.')
                .setColor(0xFF0000);
                
            // Handle error response properly
            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
}