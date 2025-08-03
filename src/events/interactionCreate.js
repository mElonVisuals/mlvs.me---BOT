/**
 * This event file handles all incoming interactions, such as slash commands.
 * It's the central point for dispatching commands to their respective files.
 *
 * @param {import('discord.js').Client} client - The Discord client.
 * @param {import('discord.js').Interaction} interaction - The interaction object.
 */
module.exports = async (client, interaction) => {
    // We only care about slash commands here.
    if (!interaction.isChatInputCommand()) return;

    // Get the command from the client's collection
    const command = client.commands.get(interaction.commandName);

    // If the command doesn't exist, we'll log it and let the user know.
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    // A small log to see which command is being executed.
    console.log(`[INFO] Executing command: ${command.data.name} by user: ${interaction.user.username}`);

    try {
        // Execute the command's logic.
        await command.execute(interaction);
    } catch (error) {
        // Log the error for debugging purposes.
        console.error(`[ERROR] An error occurred while executing command ${command.data.name}:`, error);

        // Check if the interaction has already been replied to.
        // This is a robust way to handle potential double-replies.
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: 'There was an error while executing this command!',
                ephemeral: true
            });
        } else {
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true
            });
        }
    }
};
