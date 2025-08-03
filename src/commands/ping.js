const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check the bot\'s latency'),
    
    async execute(interaction) {
        try {
            const sent = await interaction.reply({
                content: 'Pinging...',
                fetchReply: true
            });
            
            const latency = sent.createdTimestamp - interaction.createdTimestamp;
            const apiLatency = Math.round(interaction.client.ws.ping);
            
            const embed = new EmbedBuilder()
                .setTitle('🏓 Pong!')
                .addFields(
                    { name: 'Latency', value: `${latency}ms`, inline: true },
                    { name: 'API Latency', value: `${apiLatency}ms`, inline: true }
                )
                .setColor(0x00AE86)
                .setTimestamp();
                
            await interaction.editReply({ content: null, embeds: [embed] });
            
        } catch (error) {
            console.error('[ERROR] Failed to execute ping command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription('Failed to ping the bot.')
                .setColor(0xFF0000);
                
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};