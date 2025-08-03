// src/commands/botinfo.js

// Import necessary classes from discord.js
const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    // Add a category property
    category: 'Information',

    // Define the slash command data
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Displays information about the bot.'),

    // The function to execute when the command is called
    async execute(interaction) {
        // Defer the reply to give the bot time to gather the info
        await interaction.deferReply();

        // Get the bot's uptime in milliseconds
        const uptimeInSeconds = Math.floor(interaction.client.uptime / 1000);
        const days = Math.floor(uptimeInSeconds / (3600 * 24));
        const hours = Math.floor((uptimeInSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
        const seconds = Math.floor(uptimeInSeconds % 60);
        
        // Format the uptime string
        const uptimeString = `${days}d, ${hours}h, ${minutes}m, ${seconds}s`;

        // Create the embed to display the bot information
        const botInfoEmbed = new EmbedBuilder()
            .setColor('#3498db') // A nice blue color
            .setTitle('Bot Information')
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setDescription(`A comprehensive overview of ${interaction.client.user.username}.`)
            .addFields(
                { name: 'Uptime', value: uptimeString, inline: true },
                { name: 'Server Count', value: `${interaction.client.guilds.cache.size}`, inline: true },
                { name: 'User Count', value: `${interaction.client.users.cache.size}`, inline: true },
                { name: 'Ping', value: `${interaction.client.ws.ping}ms`, inline: true },
                { name: 'Total Commands', value: `${interaction.client.commands.size}`, inline: true },
                { name: 'Version', value: '1.2.0', inline: true }
                // Removed all hardware-related fields (CPU, RAM, etc.) as requested
            )
            .setFooter({ text: `Requested by ${interaction.user.tag}` })
            .setTimestamp();

        // Send the embed as the reply
        await interaction.editReply({ embeds: [botInfoEmbed] });
    },
};
