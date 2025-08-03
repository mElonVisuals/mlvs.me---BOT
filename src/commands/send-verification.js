/**
 * Verification Command
 * This command allows an administrator to send the verification message with a button.
 */
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { CustomEmbedBuilder } = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('send-verification-message')
        .setDescription('Sends the verification message with the button in the current channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Only administrators can use this command
    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder(interaction.client);
        
        // --- Configuration ---
        // You'll need to update these URLs
        const imageUrl = 'https://cdn.discordapp.com/attachments/1335734480253747297/1401617852712353894/welcome.png?ex=6890edd8&is=688f9c58&hm=3419e0ce180dde7607bf4e93457b1587560b40d2cf44326459ce34aa337a7022&';
        const footerIconUrl = 'https://cdn.discordapp.com/attachments/1335734480253747297/1400244688061202553/mlvs.me-logo.png?ex=68908c3c&is=688f3abc&hm=f85d565a9822ddf01ea64f44d015f8815e22d6cfee5f0e71aa4720b229cfa3be&';

        // Create the verification button
        const verifyButton = new ButtonBuilder()
            .setCustomId('verify_button')
            .setLabel('Verify')
            .setStyle(ButtonStyle.Success)
            .setEmoji('✅');

        const row = new ActionRowBuilder().addComponents(verifyButton);

        const welcomeEmbed = embedBuilder.createBaseEmbed('info')
            .setTitle('👋 Welcome to the Team! 👋')
            .setDescription(`Please click the button below to get verified and join the fun! Let's hit the track! 🏁`)
            .setImage(imageUrl)
            .setFooter({ text: 'mlvs.me ・﹕TEAM', iconURL: footerIconUrl });
    
        try {
            await interaction.channel.send({
                embeds: [welcomeEmbed],
                components: [row] // Add the button to the message
            });

            // Acknowledge the command
            await interaction.reply({ content: 'Verification message sent successfully!', ephemeral: true });
        } catch (error) {
            console.error(`❌ Error sending verification message: ${error.message}`);
            await interaction.reply({ content: 'An error occurred while trying to send the verification message.', ephemeral: true });
        }
    },
};
