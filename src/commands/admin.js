module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Admin panel'),
    
    async execute(interaction) {
        // Check if user has admin permissions
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            await interaction.editReply({
                content: '❌ You need administrator permissions to use this command!',
                ephemeral: true
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('🔧 Admin Panel')
            .setDescription('Administrative commands and settings')
            .addFields(
                { name: 'Server Info', value: `Guild: ${interaction.guild.name}`, inline: true },
                { name: 'Member Count', value: `${interaction.guild.memberCount}`, inline: true }
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
};