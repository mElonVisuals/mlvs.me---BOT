/**
 * Interaction Create Event Handler
 * Handles slash command interactions and provides refined error handling.
 */

const { Events } = require('discord.js');
const { CustomEmbedBuilder } = require('../utils/embedBuilder');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Only handle chat input commands (slash commands)
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`❌ No command matching ${interaction.commandName} was found.`);
            
            const embedBuilder = new CustomEmbedBuilder(interaction.client);
            const errorEmbed = embedBuilder.error(
                'Command Not Found',
                `The command \`/${interaction.commandName}\` was not found. It may be temporarily unavailable or has been removed.`
            );

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        try {
            console.log(`🔧 Executing command: ${interaction.commandName} by ${interaction.user.tag}`);
            await command.execute(interaction);
        } catch (error) {
            console.error(`❌ Error executing command ${interaction.commandName}:`, error);

            const embedBuilder = new CustomEmbedBuilder(interaction.client);
            const errorEmbed = embedBuilder.error(
                'Command Error',
                'An unexpected error occurred while executing this command. Please try again later.'
            );

            // Create a consistent reply options object
            const replyOptions = { embeds: [errorEmbed], ephemeral: true };

            // Check if the interaction has already been replied to or deferred
            // This prevents the bot from crashing and provides a graceful error message
            if (interaction.replied || interaction.deferred) {
                // If it's a long-running command, follow up with the error
                await interaction.followUp(replyOptions);
            } else {
                // Otherwise, reply directly with the error message
                await interaction.reply(replyOptions);
            }
        }
    },
};
