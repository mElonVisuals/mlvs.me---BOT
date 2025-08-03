/**
 * Message Create Event Handler
 * Handles AFK mentions and return detection
 */

const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Ignore bot messages
        if (message.author.bot) return;

        // Load AFK command to access functions
        const afkCommand = require('../commands/afk');

        // Check if the message author returned from AFK
        afkCommand.checkReturn(message);

        // Check for mentions of AFK users
        if (message.mentions.users.size > 0) {
            message.mentions.users.forEach(user => {
                // Don't notify about self-mentions
                if (user.id !== message.author.id) {
                    afkCommand.handleMention(message, user);
                }
            });
        }
    },
};
