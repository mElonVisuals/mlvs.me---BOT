/**
 * interactionCreate.js
 * This is the central hub for all user interactions.
 * It listens for slash commands, buttons, and other interactions, then routes them
 * to the correct command handler. This replaces the monolithic if/else if block
 * from the older bot versions.
 */

const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate, // The event name to listen for
    async execute(interaction) {
        // Ignore interactions that are not commands.
        if (!interaction.isChatInputCommand()) return;

        // Retrieve the command handler from the client's commands collection.
        const command = interaction.client.commands.get(interaction.commandName);

        // If the command doesn't exist, log an error and return.
        if (!command) {
            console.error(`❌ No command matching ${interaction.commandName} was found.`);
            return;
        }

        // Execute the command's logic inside a try/catch block for error handling.
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            // Check if the interaction has already been replied to or deferred.
            // If it has, use editReply. If not, use reply.
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    },
};
