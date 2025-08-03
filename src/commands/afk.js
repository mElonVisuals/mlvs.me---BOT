const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  // Define the slash command using SlashCommandBuilder
  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Sets your status to AFK (Away From Keyboard).')
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('The reason for being AFK.')
        .setRequired(false) // Make the reason optional
    ),

  /**
   * The core logic for the afk command.
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    // The main interaction handler (index.js) has already deferred the reply,
    // so we will use interaction.editReply() to send the final message.

    // Get the reason from the command options
    const reason = interaction.options.getString('reason') || 'No reason provided.';

    // This is an example of a cool, animated emoji.
    // To use your own, replace the ID with the ID of an animated emoji on your server.
    // The format is <a:emoji_name:emoji_id> for animated emojis.
    // You can get the ID by typing `\:emoji_name:` and sending it in a message,
    // then copying the resulting code.
    const animatedEmoji = '<a:checkmark:123456789012345678>'; // Replace with your animated emoji ID

    // Create a modern-looking embed
    const afkEmbed = new EmbedBuilder()
      .setColor('#5865F2') // A nice Discord-like color
      .setTitle(`${animatedEmoji} AFK Status Set! ${animatedEmoji}`)
      .setDescription(`I've set your AFK status. You are now away.`)
      .addFields(
        {
          name: '👤 User',
          value: `<@${interaction.user.id}>`,
          inline: true
        },
        {
          name: '📝 Reason',
          value: `\`\`\`${reason}\`\`\``, // Use a code block for the reason
          inline: false
        }
      )
      .setThumbnail(interaction.user.displayAvatarURL())
      .setFooter({
        text: `See you when you get back!`,
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTimestamp();

    // Use editReply() to send the final message, updating the deferred 'thinking' response.
    // This is crucial for working with the corrected interaction handler.
    await interaction.editReply({
      embeds: [afkEmbed]
    });
  },
};
