/**
 * Verification Command
 * Sends a visually engaging embed with a "Verify" button for users to click.
 */
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    // Define the slash command
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Sends the verification message with a button.'),

    async execute(interaction) {
        // --- Create the new, animated verification embed ---
        // Note: Replace the placeholder emoji IDs and custom image URL with your own.
        // For animated emojis, use the format: <:emoji_name:emoji_id>
        // For custom images, host them somewhere and use the direct URL.
        const verificationEmbed = new EmbedBuilder()
            .setColor('#3498db') // A nice blue color
            .setTitle('✨ Welcome! Please Verify to Continue ✨')
            .setDescription(
                'Hello there! To gain full access to the server\'s channels and community, you must click the button below. ' +
                'This helps us keep the server safe and bot-free! ' +
                'Once you click, you will be granted the appropriate role. ' +
                `\n\n<:animated_sparkles:123456789012345678> Click the button below to get started! `
            )
            .setAuthor({ name: 'Verification System', iconURL: interaction.client.user.displayAvatarURL() })
            .setThumbnail('https://placehold.co/100x100/3498db/ffffff?text=Verify') // Placeholder for a custom icon
            .setImage('https://placehold.co/600x200/3498db/ffffff?text=Welcome+to+the+Server!') // Placeholder for a banner image
            .setTimestamp()
            .setFooter({ text: 'MLVS Bot | Security first!', iconURL: interaction.client.user.displayAvatarURL() });

        // --- Create the interactive button ---
        const verifyButton = new ButtonBuilder()
            .setCustomId('verify-button') // This ID is what your interactionCreate.js listens for
            .setLabel('Verify Me!')
            .setEmoji('✔️') // You can use a custom emoji here as well
            .setStyle(ButtonStyle.Success);

        // Add the button to an ActionRow
        const actionRow = new ActionRowBuilder().addComponents(verifyButton);

        // Reply with the embed and the button, making sure it's visible to everyone
        await interaction.reply({
            embeds: [verificationEmbed],
            components: [actionRow],
            ephemeral: false, // Set to false so everyone can see the message and button
        });
    },
};
