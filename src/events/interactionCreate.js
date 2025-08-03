/**
 * @file interactionCreate.js
 * @description Fixed event handler for slash command interactions and button clicks.
 * Addresses double execution, unknown interaction errors, and proper response handling.
 */

const { Events } = require('discord.js');
const { CustomEmbedBuilder } = require('../utils/embedBuilder');

// IMPORTANT: Replace this with the ID of the role you want to give to verified users.
const VERIFICATION_ROLE_ID = '1399901918481879212';

// Replace this with the ID of the role you want to REMOVE from verified users.
const UNVERIFIED_ROLE_ID = '1401625907482984551';

// Track processed interactions to prevent double execution
const processedInteractions = new Set();

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Prevent double execution by checking if interaction is already processed
        if (processedInteractions.has(interaction.id)) {
            console.log(`[WARNING] Interaction ${interaction.id} already processed, skipping...`);
            return;
        }

        // Add interaction to processed set
        processedInteractions.add(interaction.id);

        // Clean up old interactions after 15 minutes to prevent memory leaks
        setTimeout(() => {
            processedInteractions.delete(interaction.id);
        }, 15 * 60 * 1000);

        // --- Handle Button Interactions ---
        if (interaction.isButton()) {
            // Check if the button is our specific verification button
            if (interaction.customId === 'verify-button') {
                console.log(`[INFO] Verification button clicked by user: ${interaction.user.tag} (ID: ${interaction.user.id})`);

                try {
                    // Defer the button update immediately to prevent timeout
                    await interaction.deferUpdate();

                    const member = interaction.guild.members.cache.get(interaction.user.id);
                    const roleToAdd = interaction.guild.roles.cache.get(VERIFICATION_ROLE_ID);
                    const roleToRemove = interaction.guild.roles.cache.get(UNVERIFIED_ROLE_ID);

                    // Check for required components
                    if (!member) {
                        console.error('[ERROR] Failed to find the member who clicked the verification button.');
                        await interaction.followUp({ 
                            content: 'An internal error occurred: the member could not be found.', 
                            ephemeral: true 
                        });
                        return;
                    }

                    if (!roleToAdd) {
                        console.error(`[ERROR] Verification role not found with ID: ${VERIFICATION_ROLE_ID}.`);
                        await interaction.followUp({ 
                            content: 'An internal error occurred: the verification role could not be found. Please notify a server administrator.', 
                            ephemeral: true 
                        });
                        return;
                    }
                    
                    // Warn if the unverified role is not found
                    if (!roleToRemove) {
                        console.warn(`[WARN] Unverified role not found with ID: ${UNVERIFIED_ROLE_ID}. Skipping removal.`);
                    }

                    // Check if user is already verified
                    if (member.roles.cache.has(VERIFICATION_ROLE_ID)) {
                        console.log(`[INFO] User ${interaction.user.tag} is already verified.`);
                        await interaction.followUp({ 
                            content: 'You have already completed the verification process.', 
                            ephemeral: true 
                        });
                        return;
                    }

                    // Remove unverified role if user has it
                    if (roleToRemove && member.roles.cache.has(UNVERIFIED_ROLE_ID)) {
                        await member.roles.remove(roleToRemove);
                        console.log(`[SUCCESS] Removed unverified role from ${interaction.user.tag}.`);
                    }

                    // Add verification role
                    await member.roles.add(roleToAdd);
                    console.log(`[SUCCESS] Added verification role to ${interaction.user.tag}.`);

                    const successEmbed = new CustomEmbedBuilder(interaction.client).success(
                        'Verification Successful',
                        'You have been granted access to the server. Welcome!'
                    );

                    await interaction.followUp({ embeds: [successEmbed], ephemeral: true });

                } catch (error) {
                    console.error(`[ERROR] Failed to process verification for ${interaction.user.tag}:`, error);
                    
                    try {
                        const errorEmbed = new CustomEmbedBuilder(interaction.client).error(
                            'Verification Error',
                            'An unexpected error occurred during verification. Please contact a server administrator.'
                        );
                        
                        if (interaction.deferred) {
                            await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
                        } else {
                            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                        }
                    } catch (followUpError) {
                        console.error('[ERROR] Failed to send error response for verification:', followUpError);
                    }
                }
            }
            return;
        }

        // --- Handle Slash Command Interactions ---
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`[ERROR] Command not found: ${interaction.commandName}.`);
            try {
                const embedBuilder = new CustomEmbedBuilder(interaction.client);
                const errorEmbed = embedBuilder.error(
                    'Command Not Found',
                    `The command \`/${interaction.commandName}\` does not exist or is not registered.`
                );
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            } catch (error) {
                console.error('[ERROR] Failed to send command not found response:', error);
            }
            return;
        }

        console.log(`[INFO] Executing command: ${interaction.commandName} by user: ${interaction.user.tag}`);

        try {
            // Commands that should be ephemeral (private responses)
            const ephemeralCommands = ['admin', 'afk'];
            
            // Commands that need to be deferred due to potential processing time
            const deferredCommands = ['botinfo', 'serverinfo', 'userinfo', 'uptime'];
            
            // Handle deferred commands
            if (deferredCommands.includes(interaction.commandName)) {
                const isEphemeral = ephemeralCommands.includes(interaction.commandName);
                await interaction.deferReply({ ephemeral: isEphemeral });
            }

            // Execute the command
            await command.execute(interaction);

        } catch (error) {
            console.error(`[ERROR] An error occurred while executing command ${interaction.commandName}:`, error);

            try {
                const embedBuilder = new CustomEmbedBuilder(interaction.client);
                const errorEmbed = embedBuilder.error(
                    'Command Execution Error',
                    'An unexpected error occurred while processing your command. Please try again later.'
                );

                // Handle response based on interaction state
                if (interaction.deferred) {
                    await interaction.editReply({ embeds: [errorEmbed] });
                } else if (interaction.replied) {
                    await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }
            } catch (responseError) {
                console.error(`[ERROR] Failed to send error response for ${interaction.commandName}:`, responseError);
            }
        }
    },
};