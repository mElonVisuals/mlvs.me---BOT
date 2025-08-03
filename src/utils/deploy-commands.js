// src/utils/deploy-commands.js

require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

async function deployCommands() {
    const commands = [];
    const commandsPath = path.join(__dirname, '../commands');

    try {
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

        const rest = new REST().setToken(process.env.DISCORD_TOKEN);

        console.log(`🚀 Started refreshing ${commands.length} application (/) commands.`);

        if (process.env.GUILD_ID && process.env.NODE_ENV === 'development') {
            const data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands },
            );
            console.log(`✅ Successfully reloaded ${data.length} guild commands.`);
        } else {
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

if (require.main === module) {
    deployCommands();
}

module.exports = { deployCommands };
