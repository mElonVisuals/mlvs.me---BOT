const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Admin panel with various management options')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        try {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                const embed = new EmbedBuilder()
                    .setTitle('❌ Access Denied')
                    .setDescription('You need Administrator permissions to use this command.')
                    .setColor(0xFF0000);
                    
                // This command is deferred as ephemeral, so use editReply
                await interaction.editReply({ embeds: [embed] });
                return;
            }
            
            const embed = new EmbedBuilder()
                .setTitle('🛠️ Admin Panel')
                .setDescription('Administrator commands and tools')
                .addFields(
                    { name: 'Server Management', value: 'Various server management tools', inline: false },
                    { name: 'User Management', value: 'User moderation tools', inline: false }
                )
                .setColor(0x00AE86)
                .setTimestamp();
                
            // Use editReply for deferred commands
            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            console.error('[ERROR] Failed to execute admin command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription('Failed to load admin panel.')
                .setColor(0xFF0000);
                
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};