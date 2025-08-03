/**
 * Help Command
 * Displays information about available bot commands
 */

const { SlashCommandBuilder } = require('discord.js');
const { CustomEmbedBuilder, THEME } = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display information about available commands'),

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder(interaction.client);
        
        // Get all commands from the client
        const commands = interaction.client.commands;
        
        // Create command list
        const commandList = commands.map(command => {
            return `**/${command.data.name}** - ${command.data.description}`;
        }).join('\n');

        const helpEmbed = embedBuilder.info(
            'Bot Commands',
            `Here are all the available commands for **${interaction.client.user.username}**:`,
            [
                {
                    name: `${THEME.emojis.star} Available Commands`,
                    value: commandList || 'No commands available.',
                    inline: false
                },
                {
                    name: '🔗 Quick Links',
                    value: '[Support Server](https://discord.gg/wgpePdK8z9) • [Invite Bot](https://discord.com/api/oauth2/authorize?client_id=1393986208828489788&permissions=0&scope=bot%20applications.commands)',
                    inline: false
                },
                {
                    name: '💡 Need Help?',
                    value: 'Use our support system to get in contact with staff to help you with your issue.',
                    inline: false
                }
            ]
        )
        // Use the new bot icon placeholder
        .setThumbnail(interaction.client.user.displayAvatarURL() || embedBuilder.getPlaceholder('botIcon'))
        // Use the new banner placeholder
        .setImage(embedBuilder.getPlaceholder('banner'));

        await interaction.reply({ embeds: [helpEmbed] });
    },
};
