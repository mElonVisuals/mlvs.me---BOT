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
