/**
 * Ready Event Handler
 * Fires when the bot successfully connects to Discord
 */

const { Events, ActivityType } = require('discord.js');
const { deployCommands } = require('../utils/deploy-commands');

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
            await deployCommands(client.application.id, process.env.GUILD_ID); // Deploy to test guild
            console.log('Development guild commands deployed.');
        }

        console.log('🎉 Bot is fully operational!');
    },
};