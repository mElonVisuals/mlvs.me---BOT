/**
 * Interaction Create Event Handler
 * Handles slash command interactions and button clicks for the verification system.
 */
const { Events } = require('discord.js');
const { CustomEmbedBuilder } = require('../utils/embedBuilder');

// IMPORTANT: Replace this with the ID of the role you want to give to verified users.
// You can get a role's ID by right-clicking the role in Discord and selecting "Copy ID".
// Make sure the bot's role is positioned ABOVE this role in the server's role list.
const VERIFICATION_ROLE_ID = '1399901918481879212';

// NEW: Replace this with the ID of the role you want to REMOVE from verified users.
const UNVERIFIED_ROLE_ID = '1401625907482984551';

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {

        // --- Handle Button Interactions ---
        if (interaction.isButton()) {
            if (interaction.customId === 'verify-button') {
                console.log(`[INFO] Verification button clicked by user: ${interaction.user.tag} (ID: ${interaction.user.id})`);

                // Defer the update immediately to prevent a timeout error.
                await interaction.deferUpdate();

                const member = interaction.guild.members.cache.get(interaction.user.id);
                const roleToAdd = interaction.guild.roles.cache.get(VERIFICATION_ROLE_ID);
                const roleToRemove = interaction.guild.roles.cache.get(UNVERIFIED_ROLE_ID);

                if (!member) {
                    console.error('[ERROR] Failed to find the member who clicked the verification button.');
                    return;
                }
                if (!roleToAdd) {
                    console.error(`[ERROR] Verification role not found with ID: ${VERIFICATION_ROLE_ID}.`);
                    await interaction.followUp({ content: 'An internal error occurred: the verification role could not be found. Please notify a server administrator.', ephemeral: true });
                    return;
                }
                if (!roleToRemove) {
                    console.error(`[WARN] Unverified role not found with ID: ${UNVERIFIED_ROLE_ID}. Skipping removal.`);
                }

                if (member.roles.cache.has(VERIFICATION_ROLE_ID)) {
                    console.log(`[INFO] User ${interaction.user.tag} is already verified.`);
                    await interaction.followUp({ content: 'You have already completed the verification process.', ephemeral: true });
                    return;
                }

                try {
                    if (roleToRemove && member.roles.cache.has(UNVERIFIED_ROLE_ID)) {
                        await member.roles.remove(roleToRemove);
                        console.log(`[SUCCESS] Removed unverified role from ${interaction.user.tag}.`);
                    }

                    await member.roles.add(roleToAdd);
                    console.log(`[SUCCESS] Added verification role to ${interaction.user.tag}.`);
                    
                    const successEmbed = new CustomEmbedBuilder(interaction.client).success(
                        'Verification Successful',
                        'You have been granted access to the server. Welcome!'
                    );
                    
                    await interaction.followUp({ embeds: [successEmbed], ephemeral: true });

                } catch (error) {
                    console.error(`[ERROR] Failed to modify roles for user ${interaction.user.tag}:`, error);
                    await interaction.followUp({ content: 'An unexpected error occurred during verification. Please contact a server administrator for assistance.', ephemeral: true });
                }
            }
            return;
        }

        // --- Handle Slash Command Interactions (revised) ---
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`[ERROR] Command not found: ${interaction.commandName}.`);
            
            const embedBuilder = new CustomEmbedBuilder(interaction.client);
            const errorEmbed = embedBuilder.error(
                'Command Not Found',
                `The command \`/${interaction.commandName}\` does not exist or is not registered.`
            );

            // The interaction hasn't been deferred, so we must use reply()
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        try {
            console.log(`[INFO] Executing command: ${interaction.commandName} by user: ${interaction.user.tag}`);
            
            // The deferReply() call has been removed from here.
            // Each command file must now handle its own deferral if needed.
            await command.execute(interaction);
        } catch (error) {
            console.error(`[ERROR] An error occurred while executing command ${interaction.commandName}:`, error);

            const embedBuilder = new CustomEmbedBuilder(interaction.client);
            const errorEmbed = embedBuilder.error(
                'Command Execution Error',
                'An unexpected error occurred while processing your command. Please try again later.'
            );
            
            // Check if the interaction has been replied to or deferred
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};
