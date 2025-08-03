/**
 * Verification Command
 * Sends a visually engaging embed with a "Verify" button for users to click.
 */
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    // Define the slash command
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Sends the verification message with a button.'),

    async execute(interaction) {
        // --- Create the improved verification embed ---
        // Note: This version maintains all of your custom emoji IDs and image links.
        const verificationEmbed = new EmbedBuilder()
            .setColor('#2ecc71') // A fresh, vibrant green to represent 'go' or 'verified'
            .setTitle('<a:thisr:1401642268992999546> Welcome to mlvs.me! Please Verify to Continue <a:thisl:1401642267759874190>')
            .setDescription(
                `Welcome to the server! To gain full access to the channels and community, you must click the verification button below.

                This is a mandatory step to keep our community safe and bot-free. Once you verify, you will be granted the necessary roles and can begin exploring!`
            )
            .setAuthor({ name: 'Verification System', iconURL: interaction.client.user.displayAvatarURL() })
            .setThumbnail('https://cdn.discordapp.com/attachments/1335734480253747297/1400244688061202553/mlvs.me-logo.png?ex=68908c3c&is=688f3abc&hm=f85d565a9822ddf01ea64f44d015f8815e22d6cfee5f0e71aa4720b229cfa3be&')
            .setImage('https://cdn.discordapp.com/attachments/1369865705238954168/1401638507012821135/verify.png?ex=68910115&is=688faf95&hm=d46d4b4d29eaa31b8583db3ac5f5da5ce6b8b2406333b1ecb2197446ca37dbeb&')
            .addFields(
                {
                    name: 'How to Verify:',
                    value: `> <a:arrow1:1401639477675294891> Simply click the "Verify Me!" button below.
> <:bot:1401641253141086219> Our system will automatically grant you access to all member channels.`,
                    inline: false,
                },
                {
                    name: 'Need Help?',
                    value: `> <:Staff:1401641828675227748> If you encounter any issues, please contact our staff team.`,
                    inline: false,
                }
            )
            .setTimestamp()
            .setFooter({ text: 'MLVS Bot | Security first!', iconURL: interaction.client.user.displayAvatarURL() });

        // --- Create the interactive button ---
        const verifyButton = new ButtonBuilder()
            .setCustomId('verify-button') // This ID must match the one your interactionCreate.js listens for
            .setLabel('Verify Me!')
            .setEmoji('<:verification:1401639982426226689>') // A key emoji to symbolize security/access
            .setStyle(ButtonStyle.Success); // Green button for a successful action

        // Add the button to an ActionRow
        const actionRow = new ActionRowBuilder().addComponents(verifyButton);

        // Reply with the embed and the button
        await interaction.reply({
            embeds: [verificationEmbed],
            components: [actionRow],
            ephemeral: false, // Ensure the message is visible to everyone
        });
    },
};
