/**
 * @file help.js
 * @description The slash command to display a dynamic list of all available commands,
 * categorized and filtered based on the user's permissions.
 */

const { SlashCommandBuilder } = require('discord.js');
// Import the custom embed builder and theme for consistent styling
const { CustomEmbedBuilder, THEME } = require('../utils/embedBuilder');

module.exports = {
    category: 'Utility',
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display information about available commands'),

    /**
     * Executes the help command.
     * @param {import('discord.js').ChatInputCommandInteraction} interaction The interaction object.
     */
    async execute(interaction) {
        const { client } = interaction;
        
        // IMPORTANT: Replace this with your bot's owner ID.
        const BOT_OWNER_ID = '952705075711729695';
        const isOwner = interaction.user.id === BOT_OWNER_ID;

        // Create a new instance of the CustomEmbedBuilder
        const embedBuilder = new CustomEmbedBuilder(client);

        // Create a Map to store commands grouped by category
        const categorizedCommands = new Map();

        // Iterate through all commands and group them
        for (const command of client.commands.values()) {
            // By default, assume the user can view the command
            let canView = true;

            // Check if the command is for the owner only.
            if (command.ownerOnly && !isOwner) {
                canView = false;
            }

            // Check for role-based permissions.
            if (canView && command.permissions && command.permissions.length > 0) {
                // If the command has specific role permissions, check if the user has any of them.
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

        // Create the main help embed using the custom builder
        const helpEmbed = embedBuilder.createBaseEmbed('info')
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
            }
        );

        // Use editReply() because the `interactionCreate` event handler
        // has already deferred the reply.
        await interaction.editReply({ embeds: [helpEmbed] });
    },
};
