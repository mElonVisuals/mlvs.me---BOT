/**
 * Ready Event Handler
 * Fires when the bot successfully connects to Discord and loads persistent reminders
 */

const { Events, ActivityType } = require('discord.js');
const { deployCommands } = require('../utils/deploy-commands');
const { initDatabase, getPendingReminders, deleteReminder } = require('../utils/database');
const { CustomEmbedBuilder } = require('../utils/embedBuilder');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log('');
        console.log('╔═══════════════════════════════════════╗');
        console.log('║           🤖 BOT READY! 🤖            ║');
        console.log('╠═══════════════════════════════════════╣');
        console.log(`║ Bot: ${client.user.tag.padEnd(30)} ║`);
        console.log(`║ ID: ${client.user.id.padEnd(31)} ║`);
        console.log(`║ Servers: ${client.guilds.cache.size.toString().padEnd(26)} ║`);
        console.log(`║ Users: ${client.users.cache.size.toString().padEnd(28)} ║`);
        console.log('╚═══════════════════════════════════════╝');
        console.log('');

        // --- Configuration for Dynamic Rich Presence ---
        // Define an array of rich presence activities.
        // The status will cycle through this list.
        const activities = [
            { name: 'your server grow 📈', type: ActivityType.Watching },
            { name: 'with your code 🤖', type: ActivityType.Playing },
            { name: `mlvs.me | /help`, type: ActivityType.Listening },
            { name: 'the latest dev streams', type: ActivityType.Streaming, url: 'https://kick.com/trancefy' },
        ];

        let currentIndex = 0;

        // Function to update the presence with the next activity
        const updatePresence = () => {
            const activity = activities[currentIndex];
            client.user.setPresence({
                activities: [activity],
                status: 'online', // Can also be 'dnd', 'idle', or 'invisible'
            });
            
            // Log the new presence to the console
            console.log(`✨ Bot presence updated to: ${ActivityType[activity.type]} "${activity.name}"`);
            
            // Move to the next activity, looping back to the start if at the end of the array
            currentIndex = (currentIndex + 1) % activities.length;
        };

        // Set the initial presence immediately
        updatePresence();

        // Use setInterval to change the presence at the specified interval (e.g., every 20 seconds)
        setInterval(updatePresence, 20000);

        // Deploy commands on startup
        if (process.env.NODE_ENV === 'production') {
            console.log('Deploying global commands in production...');
            await deployCommands(client.application.id);
            console.log('Global commands deployed.');
        } else {
            console.log(`Deploying commands to development guild (${process.env.GUILD_ID})...`);
            await deployCommands(client.application.id, process.env.GUILD_ID);
            console.log('Development guild commands deployed.');
        }

        // --- MySQL Database Initialization and Reminder Loading ---
        try {
            await initDatabase();
            const reminders = await getPendingReminders();

            console.log(`⏳ Found ${reminders.length} pending reminders to reschedule.`);

            for (const reminder of reminders) {
                const timeInMs = reminder.remindAt - Date.now();
                const reminderId = reminder.id;

                if (timeInMs > 0) {
                    setTimeout(async () => {
                        try {
                            const user = await client.users.fetch(reminder.userId);
                            const channel = await client.channels.fetch(reminder.channelId);

                            if (user && channel) {
                                const embedBuilder = new CustomEmbedBuilder(client);
                                const reminderEmbed = embedBuilder.info(
                                    'Reminder!',
                                    `Hey ${user}! You asked to be reminded about:`
                                ).addFields(
                                    { name: 'Your Message', value: `\`\`\`${reminder.message}\`\`\`` }
                                );

                                await channel.send({ content: `<@${user.id}>`, embeds: [reminderEmbed] });
                            }

                            // Delete the reminder from the database after sending
                            await deleteReminder(reminderId);
                        } catch (error) {
                            console.error(`❌ Error sending or deleting reminder ${reminderId}:`, error);
                        }
                    }, timeInMs);
                } else {
                    // If a reminder is in the past (e.g. bot was offline), send it immediately
                    try {
                        const user = await client.users.fetch(reminder.userId);
                        const channel = await client.channels.fetch(reminder.channelId);
                        if (user && channel) {
                            const embedBuilder = new CustomEmbedBuilder(client);
                            const reminderEmbed = embedBuilder.info(
                                'Reminder!',
                                `Hey ${user}! I'm sending this reminder now because I was offline:`
                            ).addFields(
                                { name: 'Your Message', value: `\`\`\`${reminder.message}\`\`\`` }
                            );

                            await channel.send({ content: `<@${user.id}>`, embeds: [reminderEmbed] });
                        }
                        // Delete the reminder from the database
                        await deleteReminder(reminderId);
                    } catch (error) {
                        console.error(`❌ Error sending immediate reminder ${reminderId}:`, error);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error in ready.js during reminder loading:', error);
        }
    },
};
