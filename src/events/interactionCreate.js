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
const UNVERIFIED_ROLE_ID = 'YOUR_UNVERIFIED_ROLE_ID_HERE';

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {

        // --- Handle Button Interactions ---
        if (interaction.isButton()) {
            // Check if the button click is from our verification button
            if (interaction.customId === 'verify-button') {
                console.log(`🔒 Verification button clicked by ${interaction.user.tag}`);

                // Defer the update immediately to prevent a timeout error.
                // This tells Discord "I'm working on it" and prevents the "interaction failed" message.
                await interaction.deferUpdate();

                const member = interaction.guild.members.cache.get(interaction.user.id);
                const roleToAdd = interaction.guild.roles.cache.get(VERIFICATION_ROLE_ID);
                // NEW: Get the role to be removed
                const roleToRemove = interaction.guild.roles.cache.get(UNVERIFIED_ROLE_ID);

                // Check for errors before attempting to add the role
                if (!member) {
                    console.error('❌ Could not find the member who clicked the button.');
                    return;
                }
                if (!roleToAdd) {
                    console.error(`❌ Could not find the role with ID: ${VERIFICATION_ROLE_ID}`);
                    await interaction.followUp({ content: 'Error: The verification role could not be found. Please contact our staff team.', ephemeral: true });
                    return;
                }
                // NEW: Check if the role to be removed exists
                if (!roleToRemove) {
                    console.error(`❌ Could not find the role with ID: ${UNVERIFIED_ROLE_ID}`);
                    await interaction.followUp({ content: 'Error: The unverified role could not be found. Please contact our staff team.', ephemeral: true });
                    return;
                }

                // Check if the member already has the verification role
                if (member.roles.cache.has(VERIFICATION_ROLE_ID)) {
                    console.log(`✅ ${interaction.user.tag} is already verified.`);
                    await interaction.followUp({ content: 'You are already verified!', ephemeral: true });
                    return;
                }

                try {
                    // NEW: Check if the member has the unverified role before attempting to remove it.
                    if (member.roles.cache.has(UNVERIFIED_ROLE_ID)) {
                        // Remove the old role.
                        await member.roles.remove(roleToRemove);
                        console.log(`✅ Successfully removed the unverified role from ${interaction.user.tag}.`);
                    } else {
                        console.log(`ℹ️ ${interaction.user.tag} did not have the unverified role. Skipping removal.`);
                    }

                    // Add the verification role to the user
                    await member.roles.add(roleToAdd);
                    console.log(`✅ Successfully verified ${interaction.user.tag} and added the role.`);
                    
                    const successEmbed = new CustomEmbedBuilder(interaction.client).success(
                        'Verification Complete!',
                        'You have been successfully verified and now have full access to the server! Your old unverified role has been removed.'
                    );
                    
                    // Reply to the user with a success message
                    await interaction.followUp({ embeds: [successEmbed], ephemeral: true });

                } catch (error) {
                    console.error(`❌ Failed to update roles for ${interaction.user.tag}:`, error);
                    await interaction.followUp({ content: 'An error occurred while trying to verify you. Please contact a staff member.', ephemeral: true });
                }
            }
            return; // Exit the function after handling the button interaction
        }


        // --- Handle Slash Command Interactions (existing code) ---
        // This part of the code remains the same to handle all other slash commands
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

            const replyOptions = { embeds: [errorEmbed], ephemeral: true };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(replyOptions);
            } else {
                await interaction.reply(replyOptions);
            }
        }
    },
};
