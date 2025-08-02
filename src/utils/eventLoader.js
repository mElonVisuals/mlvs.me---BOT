/**
 * Event Loader Utility
 * Dynamically loads all event files from the events directory
 */

const fs = require('fs').promises;
const path = require('path');

async function loadEvents(client) {
    const eventsPath = path.join(__dirname, '../events');
    
    try {
        const eventFiles = await fs.readdir(eventsPath);
        const jsFiles = eventFiles.filter(file => file.endsWith('.js'));
        
        console.log(`📂 Loading ${jsFiles.length} event(s)...`);
        
        for (const file of jsFiles) {
            const filePath = path.join(eventsPath, file);
            const event = require(filePath);
            
            // Validate event structure
            if ('name' in event && 'execute' in event) {
                if (event.once) {
                    client.once(event.name, (...args) => event.execute(...args));
                } else {
                    client.on(event.name, (...args) => event.execute(...args));
                }
                console.log(`✅ Loaded event: ${event.name}`);
            } else {
                console.log(`⚠️  Event at ${filePath} is missing required "name" or "execute" property.`);
            }
        }
        
        console.log('✨ All events loaded successfully!');
    } catch (error) {
        console.error('❌ Error loading events:', error);
    }
}

module.exports = { loadEvents };