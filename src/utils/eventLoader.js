/**
 * eventLoader.js
 * This utility function loads all event files from the `src/events` directory.
 * It dynamically reads each file, requires it, and attaches the handler to the
 * client's event listeners.
 */

const fs = require('fs');
const path = require('path');

// This function takes the Discord client as an argument to access its methods,
// specifically client.on() and client.once().
async function loadEvents(client) {
    // Define the path to the events directory.
    const eventsPath = path.join(__dirname, '..', 'events');

    try {
        // Read all files from the events directory.
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

        // Loop through each event file.
        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const event = require(filePath);

            // Attach the event handler to the client.
            // The `once` property in the event file determines if it should run once or multiple times.
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
                console.log(`✅ Loaded 'once' event: ${event.name}`);
            } else {
                client.on(event.name, (...args) => event.execute(...args));
                console.log(`✅ Loaded 'on' event: ${event.name}`);
            }
        }
    } catch (error) {
        console.error('❌ Failed to load events:', error);
        throw error;
    }
}

module.exports = { loadEvents };
