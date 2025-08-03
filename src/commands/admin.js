// src/commands/admin.js

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    category: 'Admin',
    // Add the ID of the role required to run this command.
    // Replace 'YOUR_ROLE_ID' with the actual ID of the desired role.
    permissions: ['1399901912182292481'], 
    
    // Set to true if only the bot owner should be able to run this command globally.
    ownerOnly: true,

    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('A command only accessible by admins and the bot owner.'),

    async execute(interaction) {
        // This command will only run if the permission checks in the main handler pass.
        const successEmbed = new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('Admin Command Executed!')
            .setDescription(`This command can only be used by the bot owner and users with the required role.`)
            .setTimestamp();

        await interaction.reply({ embeds: [successEmbed] });
    },
};
