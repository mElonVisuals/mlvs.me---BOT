/**
 * This command file provides a dynamic help menu.
 * It automatically reads all loaded commands and displays them in a user-friendly embed.
 * Commands are filtered based on the user's permissions, ensuring they only see what they can use.
 */

const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    // The command data defines the name and description of the slash command.
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays a list of all available commands.'),

    // The execute function contains the core logic for the command.
    async execute(interaction) {
        // Defer the reply to give the bot time to process and build the help embed.
        await interaction.deferReply({ ephemeral: true });

        // Access the client object to get the commands collection.
        const { client } = interaction;
        const commands = client.commands;

        // Filter the commands to only show those the user has permission to use.
        const availableCommands = commands.filter(command => {
            // Check for owner-only commands. BOT_OWNER_ID should be in your .env file.
            if (command.ownerOnly && interaction.user.id !== process.env.BOT_OWNER_ID) {
                return false;
            }
            
            // Check for commands that require specific roles.
            if (command.permissions && command.permissions.length > 0) {
                const memberRoles = interaction.member?.roles?.cache;
                // If the user doesn't have any roles or doesn't have a required role, they can't use the command.
                if (!memberRoles || !command.permissions.some(roleId => memberRoles.has(roleId))) {
                    return false;
                }
            }
            
            return true;
        });

        // Format the command list for the embed's field.
        const commandList = availableCommands.map(cmd => {
            // Use the data.name and data.description properties from the command's SlashCommandBuilder.
            return `\`/${cmd.data.name}\` - ${cmd.data.description}`;
        }).join('\n');

        // Create and customize the help embed.
        const helpEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('Bot Commands')
            .setDescription('Here is a list of all the commands you can use.')
            .addFields(
                { name: 'Available Commands', value: commandList || 'No commands available.' }
            )
            .setTimestamp()
            .setFooter({ text: 'Reworked for V2 by mlvs.me' });

        // Edit the deferred reply with the complete help embed.
        await interaction.editReply({ embeds: [helpEmbed] });
    },
};
