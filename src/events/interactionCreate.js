// This replaces the entire client.on('interactionCreate', ...) block

client.on('interactionCreate', async interaction => {
    // Only process slash command interactions
    if (!interaction.isChatInputCommand()) return;

    // Get the command from the client's command collection
    const command = interaction.client.commands.get(interaction.commandName);

    // If the command doesn't exist, log an error and return
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    console.log(`[INFO] Executing command: ${interaction.commandName} by user: ${interaction.user.username}`);

    try {
        // --- PRE-EXECUTION PERMISSION CHECKS ---
        // These checks happen BEFORE we defer. This is more efficient.
        const BOT_OWNER_ID = '952705075711729695';

        // Check if the command is for the owner only
        if (command.ownerOnly && interaction.user.id !== BOT_OWNER_ID) {
            const forbiddenEmbed = new EmbedBuilder()
                .setColor(0xFEE75C)
                .setTitle('Permission Denied')
                .setDescription('This command is only available to the bot owner.')
                .setTimestamp();
            return await interaction.reply({ embeds: [forbiddenEmbed], flags: MessageFlags.Ephemeral });
        }

        // Check for role-based permissions
        if (command.permissions && command.permissions.length > 0) {
            const memberRoles = interaction.member?.roles?.cache;
            if (!memberRoles || !command.permissions.some(roleId => memberRoles.has(roleId))) {
                const forbiddenEmbed = new EmbedBuilder()
                    .setColor(0xFEE75C)
                    .setTitle('Permission Denied')
                    .setDescription('You do not have the required role to use this command.')
                    .setTimestamp();
                return await interaction.reply({ embeds: [forbiddenEmbed], flags: MessageFlags.Ephemeral });
            }
        }

        // 🚨 CRITICAL FIX: Defer the reply right here.
        // This sends a "thinking..." message and buys the bot more time.
        // The `ephemeral` flag makes the thinking message only visible to the user.
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        // If all checks pass, execute the command
        // The command file will now use interaction.editReply() to send the final message.
        await command.execute(interaction);

    } catch (error) {
        console.error(`[ERROR] An error occurred while executing command ${interaction.commandName}:`, error);

        // This check handles cases where a command failed BEFORE or AFTER it was deferred.
        if (interaction.deferred) {
            // If the reply was deferred, we need to edit the deferred message.
            await interaction.editReply({
                content: 'There was an error while executing this command!',
                ephemeral: true
            }).catch(err => console.error('Failed to send error follow-up:', err));
        } else {
            // If the reply was not deferred (e.g., an error happened during permission checks),
            // we can still send a regular reply.
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true
            }).catch(err => console.error('Failed to send error reply:', err));
        }
    }
});
