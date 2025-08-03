// src/commands/help.js

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    category: 'Utility',
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display information about available commands'),

    async execute(interaction) {
        const { client } = interaction;
        
        // Get your bot's owner ID from the main file or configuration
        const BOT_OWNER_ID = '952705075711729695';
        const isOwner = interaction.user.id === BOT_OWNER_ID;

        // Create an object to store commands grouped by category
        const categorizedCommands = new Map();

        // Iterate through all commands and group them
        for (const [name, command] of client.commands) {
            // Check permissions before adding to the list
            let canView = true;

            // Check if the command is for the owner only.
            if (command.ownerOnly && !isOwner) {
                canView = false;
            }

            // Check for role-based permissions.
            if (canView && command.permissions && command.permissions.length > 0) {
                const memberRoles = interaction.member.roles.cache;
                const hasPermission = command.permissions.some(roleId => memberRoles.has(roleId));
                if (!hasPermission) {
                    canView = false;
                }
            }

            // Only add commands the user can see
            if (canView) {
                const category = command.category || 'Uncategorized';
                if (!categorizedCommands.has(category)) {
                    categorizedCommands.set(category, []);
                }
                categorizedCommands.get(category).push(command);
            }
        }

        // Create the main help embed
        const helpEmbed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle(`🤖 ${client.user.username} Commands`)
            .setDescription('Here is a list of all available commands, organized by category.')
            .setThumbnail(client.user.displayAvatarURL());

        // Add a field for each category
        if (categorizedCommands.size > 0) {
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
        } else {
            helpEmbed.setDescription('You do not have access to any commands.');
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
