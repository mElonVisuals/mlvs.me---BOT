/**
 * Ready Event Handler
 * Fires when the bot successfully connects to Discord and loads reminders from the database.
 */

const { Events, ActivityType } = require('discord.js');
const { deployCommands } = require('../utils/deploy-commands');
const { connectToDatabase, getReminders, checkReminderStatus } = require('../utils/database');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log('');
        console.log('╔═══════════════════════════════════════╗');
        console.log('║            🤖 BOT READY! 🤖            ║');
        console.log('╠═══════════════════════════════════════╣');
        console.log(`║ Bot: ${client.user.tag.padEnd(30)} ║`);
        console.log(`║ ID: ${client.user.id.padEnd(31)} ║`);
        console.log(`║ Servers: ${client.guilds.cache.size.toString().padEnd(26)} ║`);
        console.log(`║ Users: ${client.users.cache.size.toString().padEnd(28)} ║`);
        console.log('╚═══════════════════════════════════════╝');
        console.log('');

        // Set bot activity/status
        client.user.setActivity({
            name: 'mlvs.me | /help',
            type: ActivityType.Playing,
        });

        try {
            // Attempt to connect to the database
            await connectToDatabase();
            console.log('✅ Successfully connected to the database.');

            // Load and schedule reminders from the database on startup
            const reminders = await getReminders();
            if (reminders.length > 0) {
                console.log(`⏳ Found ${reminders.length} pending reminders. Re-scheduling now...`);
                for (const reminder of reminders) {
                    checkReminderStatus(client, reminder);
                }
            } else {
                console.log('✅ No pending reminders found on startup.');
            }

            // Deploy commands on startup (in development)
            if (process.env.NODE_ENV === 'production') {
                console.log('Deploying global commands in production...');
                await deployCommands(client.application.id); // Deploy globally for production
                console.log('Global commands deployed.');
            } else {
                console.log(`Deploying commands to development guild (${process.env.GUILD_ID})...`);
                await deployCommands(client.application.id, process.env.GUILD_ID);
                console.log(`✅ Guild commands deployed to ${process.env.GUILD_ID}.`);
            }
        } catch (error) {
            console.error('❌ An error occurred during startup:', error);
            process.exit(1);
        }
    },
};
