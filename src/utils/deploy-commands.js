/**
 * deploy-commands.js
 * Run this file with 'node deploy-commands.js' to register your slash commands
 * to a specific guild (server).
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { REST, Routes } = require('discord.js');

// Get the necessary IDs and token from your environment variables
const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

// Check if all necessary environment variables are set
if (!DISCORD_TOKEN || !CLIENT_ID || !GUILD_ID) {
    console.error("❌ ERROR: Missing one or more environment variables. Ensure DISCORD_TOKEN, CLIENT_ID, and GUILD_ID are set in your .env file.");
    process.exit(1);
}

const commands = [];
// Grab all the command files from the commands directory
const foldersPath = path.join(__dirname, 'src', 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(DISCORD_TOKEN);

// Deploy the commands
(async () => {
    try {
        console.log(`🚀 Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        );

        console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error("❌ ERROR during command deployment:", error);
    }
})();
