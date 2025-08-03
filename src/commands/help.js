// src/commands/help.js

const { SlashCommandBuilder } = require('discord.js');
const { CustomEmbedBuilder, THEME } = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display information about available commands'),

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder(interaction.client);
        
        // Get all commands from the client's collection
        const commands = interaction.client.commands;

        // Group commands by category
        const categorizedCommands = new Map();
        for (const [name, command] of commands) {
            const category = command.category || 'Uncategorized';
            if (!categorizedCommands.has(category)) {
                categorizedCommands.set(category, []);
            }
            categorizedCommands.get(category).push(command);
        }

        const helpEmbed = embedBuilder.info(
            'Bot Commands',
            `Here are all the available commands for **${interaction.client.user.username}**:`
        )
        .setThumbnail(interaction.client.user.displayAvatarURL());

        // Create a new field for each category
        for (const [category, cmds] of categorizedCommands.entries()) {
            const commandList = cmds.map(command => {
                // Ensure command.data and command.data.description are not null or undefined
                const description = command.data?.description || 'No description provided.';
                return `\`/${command.data?.name}\` - ${description}`;
            }).join('\n');
            
            helpEmbed.addFields({
                name: `📁 ${category} Commands`,
                value: commandList,
                inline: false
            });
        }
        
        // Add quick links as a separate field
        helpEmbed.addFields({
            name: '🔗 Quick Links',
            value: '[Support Server](https://discord.gg/wgpePdK8z9) • [Invite Bot](https://discord.com/api/oauth2/authorize?client_id=1393986208828489788&permissions=0&scope=bot%20applications.commands)',
            inline: false
        });

        await interaction.reply({ embeds: [helpEmbed] });
    },
};
