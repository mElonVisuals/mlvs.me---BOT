/**
 * Command Loader Utility
 * Dynamically loads all command files from the commands directory
 */

const fs = require('fs').promises;
const path = require('path');

async function loadCommands(client) {
    const commandsPath = path.join(__dirname, '../commands');
    
    try {
        const commandFiles = await fs.readdir(commandsPath);
        const jsFiles = commandFiles.filter(file => file.endsWith('.js'));
        
        console.log(`📂 Loading ${jsFiles.length} command(s)...`);
        
        for (const file of jsFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            
            // Validate command structure
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                console.log(`✅ Loaded command: ${command.data.name}`);
            } else {
                console.log(`⚠️  Command at ${filePath} is missing required "data" or "execute" property.`);
            }
        }
        
        console.log('✨ All commands loaded successfully!');
    } catch (error) {
        console.error('❌ Error loading commands:', error);
    }
}

module.exports = { loadCommands };