/**
 * Admin Command (example)
 * This is an example of a simple admin command that checks for permissions.
 */

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    category: 'Admin',
    
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Admin-only command to perform actions')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Defer the reply at the start of the command execution
        await interaction.deferReply({ ephemeral: true });

        const adminEmbed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('Admin Actions')
            .setDescription('Welcome, Administrator! You have access to the admin panel.')
            .addFields({
                name: 'Permissions',
                value: 'This command can only be used by server administrators.'
            });

        await interaction.editReply({ embeds: [adminEmbed] });
    },
};
