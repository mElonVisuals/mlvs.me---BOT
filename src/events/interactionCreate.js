/**
 * Interaction Create Event Handler
 * Handles slash command interactions
 */

const { Events } = require('discord.js');
const { CustomEmbedBuilder } = require('../utils/embedBuilder');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Only handle chat input commands (slash commands)
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`❌ No command matching ${interaction.commandName} was found.`);
            
            const embedBuilder = new CustomEmbedBuilder(interaction.client);
            const errorEmbed = embedBuilder.error(
                'Command Not Found',
                `The command \`/${interaction.commandName}\` was not found. This might be a temporary issue.`
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
                'There was an error while executing this command. Please try again later.',
                [
                    {
                        name: 'Error Details',
                        value: `\`\`\`${error.message.slice(0, 1000)}\`\`\``,
                        inline: false
                    }
                ]
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