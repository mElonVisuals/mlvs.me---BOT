module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // Only handle slash commands
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            // Always defer first to prevent timeout
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply({ ephemeral: false });
            }

            console.log(`[INFO] Executing command: ${interaction.commandName} by user: ${interaction.user.tag}`);
            
            // Execute the command
            await command.execute(interaction);
            
        } catch (error) {
            console.error(`[ERROR] An error occurred while executing command ${interaction.commandName}:`, error);
            
            // Safe error response
            const errorMessage = {
                content: '❌ There was an error while executing this command!',
                ephemeral: true
            };

            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply(errorMessage);
                } else if (interaction.deferred) {
                    await interaction.editReply(errorMessage);
                } else {
                    await interaction.followUp(errorMessage);
                }
            } catch (replyError) {
                console.error(`[ERROR] Failed to send error response for ${interaction.commandName}:`, replyError);
            }
        }
    },
};