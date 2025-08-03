/**
 * commandLoader.js
 * This utility function loads all command files from the `src/commands` directory.
 * It dynamically reads each file, requires it, and sets it on the client's command collection.
 */

const fs = require('fs');
const path = require('path');

// This function takes the Discord client as an argument to access its properties,
// specifically the client.commands collection.
async function loadCommands(client) {
    // Define the path to the commands directory.
    const commandsPath = path.join(__dirname, '..', 'commands');

    try {
        // Read all files from the commands directory.
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        
        // Loop through each command file.
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);

            // Set a new item in the Collection with the command name as the key and the exported module as the value.
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                console.log(`✅ Loaded command: ${command.data.name}`);
            } else {
                console.warn(`❌ The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    } catch (error) {
        console.error('❌ Failed to load commands:', error);
        throw error;
    }
}

module.exports = { loadCommands };
