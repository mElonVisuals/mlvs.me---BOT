/**
 * Command Deployment Utility
 * Registers slash commands with Discord
 */

require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

async function deployCommands() {
    const commands = [];
    const commandsPath = path.join(__dirname, '../commands');

    try {
        // Load all command files
        const commandFiles = await fs.readdir(commandsPath);
        const jsFiles = commandFiles.filter(file => file.endsWith('.js'));

        for (const file of jsFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
                console.log(`✅ Loaded command data: ${command.data.name}`);
            } else {
                console.log(`⚠️  Command at ${filePath} is missing required "data" or "execute" property.`);
            }
        }

        // Construct and prepare an instance of the REST module
        const rest = new REST().setToken(process.env.DISCORD_TOKEN);

        console.log(`🚀 Started refreshing ${commands.length} application (/) commands.`);

        // Deploy commands globally or to a specific guild
        if (process.env.GUILD_ID && process.env.NODE_ENV === 'development') {
            // Deploy to specific guild for testing
            const data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands },
            );
            console.log(`✅ Successfully reloaded ${data.length} guild commands.`);
        } else {
            // Deploy globally
            const data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands },
            );
            console.log(`✅ Successfully reloaded ${data.length} global commands.`);
        }

    } catch (error) {
        console.error('❌ Error deploying commands:', error);
        process.exit(1);
    }
}

// Run the deployment if this file is executed directly
if (require.main === module) {
    deployCommands();
}

module.exports = { deployCommands };