/**
 * Ready Event Handler
 * Fires when the bot successfully connects to Discord
 */

const { Events, ActivityType } = require('discord.js');
const { deployCommands } = require('../utils/deploy-commands');
const { query } = require('../utils/database');
const ms = require('ms');
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

        // Deploy commands on startup (in development)
        if (process.env.NODE_ENV === 'production') {
            console.log('Deploying global commands in production...');
            await deployCommands(client.application.id); // Deploy globally for production
            console.log('Global commands deployed.');
        } else {
            console.log(`Deploying commands to development guild (${process.env.GUILD_ID})...`);
            await deployCommands(client.application.id, process.env.GUILD_ID); // Deploy to specific guild for testing
            console.log('Guild commands deployed.');
        }
        
        // Load and re-queue reminders from the database
        try {
            const reminders = await query('SELECT * FROM reminders');
            console.log(`🕒 Found ${reminders.length} pending reminder(s).`);

            for (const reminder of reminders) {
                const timeRemaining = reminder.timestamp - Date.now();
                if (timeRemaining > 0) {
                    setTimeout(async () => {
                        try {
                            const user = await client.users.fetch(reminder.user_id);
                            const channel = await client.channels.fetch(reminder.channel_id);

                            if (user && channel) {
                                const embedBuilder = new CustomEmbedBuilder(client);
                                const reminderEmbed = embedBuilder.info(
                                    'Reminder!',
                                    `Hey ${user}! You asked me to remind you about:`
                                ).addFields(
                                    { name: 'Your Message', value: `\`\`\`${reminder.message}\`\`\`` }
                                );
                                await channel.send({ content: `<@${reminder.user_id}>`, embeds: [reminderEmbed] });

                                await query('DELETE FROM reminders WHERE id = ?', [reminder.id]);
                            }
                        } catch (error) {
                            console.error(`Error sending a persistent reminder:`, error);
                        }
                    }, timeRemaining);
                } else {
                    // If the time has already passed, send it immediately
                    const user = await client.users.fetch(reminder.user_id);
                    const channel = await client.channels.fetch(reminder.channel_id);

                    if (user && channel) {
                        const embedBuilder = new CustomEmbedBuilder(client);
                        const reminderEmbed = embedBuilder.info(
                            'Reminder!',
                            `Hey ${user}! You asked me to remind you about:`
                        ).addFields(
                            { name: 'Your Message', value: `\`\`\`${reminder.message}\`\`\`` }
                        );
                        await channel.send({ content: `<@${reminder.user_id}>`, embeds: [reminderEmbed] });

                        await query('DELETE FROM reminders WHERE id = ?', [reminder.id]);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error loading reminders on startup:', error);
        }
    },
};
