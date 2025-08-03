/**
 * ready.js
 * This event fires once the bot successfully logs in.
 * It registers the slash commands to a specific guild and logs a success message.
 */

const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady, // The event name to listen for
    once: true, // This event should only run once
    async execute(client) {
        // Log a success message to the console.
        console.log(`🚀 Ready! Logged in as ${client.user.tag}`);

        // Since the bot is for a single server, we register commands to that guild.
        // This is much faster than global registration.
        const guildId = process.env.GUILD_ID; // Guild ID from your .env file
        if (!guildId) {
            console.error('❌ GUILD_ID is not defined in your .env file. Commands will not be registered.');
            return;
        }

        try {
            // Get the specific guild object.
            const guild = await client.guilds.fetch(guildId);

            // Transform the command collection into an array of command data.
            const commandData = client.commands.map(cmd => cmd.data.toJSON());

            // Set the commands for the guild.
            await guild.commands.set(commandData);
            console.log(`✅ Successfully registered ${commandData.length} slash commands to guild ID: ${guildId}`);
        } catch (error) {
            console.error('❌ Failed to register slash commands:', error);
        }
    },
};
