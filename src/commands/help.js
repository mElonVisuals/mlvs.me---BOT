// src/commands/help.js

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    category: 'Utility', // This command also has a category
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display information about available commands'),

    async execute(interaction) {
        const { client } = interaction;

        // Create an object to store commands grouped by category
        const categorizedCommands = new Map();

        // Iterate through all commands and group them
        for (const [name, command] of client.commands) {
            const category = command.category || 'Uncategorized';
            if (!categorizedCommands.has(category)) {
                categorizedCommands.set(category, []);
            }
            categorizedCommands.get(category).push(command);
        }

        // Create the main help embed
        const helpEmbed = new EmbedBuilder()
            .setColor(0x5865F2) // Use a consistent, modern color
            .setTitle(`🤖 ${client.user.username} Commands`)
            .setDescription('Here is a list of all available commands, organized by category.')
            .setThumbnail(client.user.displayAvatarURL());

        // Add a field for each category
        for (const [category, commands] of categorizedCommands) {
            const commandList = commands
                .map(cmd => `\`/${cmd.data.name}\` - ${cmd.data.description}`)
                .join('\n');

            helpEmbed.addFields({
                name: `__${category}__`,
                value: commandList,
                inline: false
            });
        }

        // Add quick links and a footer
        helpEmbed.addFields(
            {
                name: '🔗 Quick Links',
                value: '[Support Server](https://discord.gg/wgpePdK8z9) • [Invite Bot](https://discord.com/api/oauth2/authorize?client_id=1393986208828489788&permissions=0&scope=bot%20applications.commands)',
                inline: false
            },
        );

        helpEmbed.setFooter({
            text: `Requested by ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL()
        });

        await interaction.reply({ embeds: [helpEmbed] });
    },
};
