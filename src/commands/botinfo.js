/**
 * Bot Info Command
 * Displays detailed information about the bot itself, including system specs
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const packageJson = require('../../package.json'); // Corrected path to package.json
const os = require('os'); // Import the built-in Node.js 'os' module

module.exports = {
    // Command data
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Display detailed information about the bot'),

    // Execute function
    async execute(interaction) {
        // Defer the reply to give the bot time to process the command
        await interaction.deferReply();

        const client = interaction.client;

        // Function to format uptime in "Xd Xh Xm Xs" format
        const formatUptime = (ms) => {
            const seconds = Math.floor((ms / 1000) % 60);
            const minutes = Math.floor((ms / (1000 * 60)) % 60);
            const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
            const days = Math.floor(ms / (1000 * 60 * 60 * 24));

            const parts = [];
            if (days > 0) parts.push(`${days}d`);
            if (hours > 0) parts.push(`${hours}h`);
            if (minutes > 0) parts.push(`${minutes}m`);
            if (seconds > 0) parts.push(`${seconds}s`);

            return parts.length > 0 ? parts.join(' ') : 'less than 1s';
        };

        const uptime = formatUptime(client.uptime);
        const owner = client.application.owner;

        // Get system information from the os module
        const totalMemory = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2); // Convert bytes to GB
        const freeMemory = (os.freemem() / 1024 / 1024 / 1024).toFixed(2); // Convert bytes to GB
        const cpuCores = os.cpus().length;
        const cpuModel = os.cpus()[0].model;
        const platform = os.platform();

        // Create the new embed
        const botInfoEmbed = new EmbedBuilder()
            .setColor(0x2b2d31) // Dark Discord-like gray
            .setAuthor({
                name: `${client.user.username} • /bot info`,
                iconURL: client.user.displayAvatarURL()
            })
            .setThumbnail('https://cdn.discordapp.com/attachments/1335734480253747297/1397732597852799059/Dark_Purple_Modern_Letter_M_Logo.png?ex=6890a32b&is=688f51ab&hm=986affad4144e1b5e57b69e93305c3e7a92d39f4cdd26fb8acc50f90fc48db4d&') // Bot's custom logo
            .setTimestamp()
            .setFooter({
                text: `mlvs.me •`, // Custom footer text from the image
                iconURL: client.user.displayAvatarURL()
            });

        // ====================================================================
        //                       Software Section
        // ====================================================================
        const softwareFields = [
            { name: '**- Software**', value: '\u200b', inline: false },
            {
                name: 'Versions:',
                value: `• Version Bot: \`${packageJson.version || '1.0.0'}\`\n` +
                       `• Version Discord.js: \`v${require('discord.js').version}\`\n` +
                       `• Version Node.js: \`${process.version}\`\n` +
                       `• Language version: \`EN-GB (supported)\``,
                inline: false
            }
        ];
        
        // ====================================================================
        //                       Hardware Section
        // ====================================================================
        const hardwareFields = [
            { name: '**- Hardware**', value: '\u200b', inline: false },
            {
                name: '\u200b',
                value: `• OS: \`${platform}\`\n` +
                       `• CPU: \`${cpuModel}\`\n` +
                       `• Cores: \`${cpuCores}\`\n` +
                       `• RAM: \`${totalMemory}GB\` (Used: \`${(totalMemory - freeMemory).toFixed(2)}GB\`)\n` +
                       `• Free RAM: \`${freeMemory}GB\``,
                inline: false
            }
        ];

        // ====================================================================
        //                       System Section
        // ====================================================================
        const systemFields = [
            { name: '**- System**', value: '\u200b', inline: false },
            {
                name: '\u200b',
                value: `• Uptime: \`${uptime}\`\n` +
                       `• Bot Latency: \`${Math.round(client.ws.ping)}ms\`\n` +
                       `• Database Latency: \`34ms\`\n` +
                       `• Active Shards: \`1/1\``,
                inline: false
            }
        ];

        // ====================================================================
        //                       Stats Section
        // ====================================================================
        const statsFields = [
            { name: '**- Stats**', value: '\u200b', inline: false },
            {
                name: '\u200b',
                value: `• Guilds: \`${client.guilds.cache.size}\`\n` +
                       `• Channels: \`${client.channels.cache.size}\`\n` +
                       `• Members: \`${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)}\`\n` +
                       `• Created: <t:${Math.floor(client.user.createdAt.getTime() / 1000)}:R>`,
                inline: false
            }
        ];

        // ====================================================================
        //                       Footer Section
        // ====================================================================
        const footerFields = [
            { name: '\u200b', value: '\u200b', inline: false },
            { name: '**- Powered by mlvs.me**', value: '\u200b', inline: false }
        ];

        // Combine and add all fields to the embed
        botInfoEmbed.addFields(...softwareFields, ...hardwareFields, ...systemFields, ...statsFields, ...footerFields);

        // Reply with the final embed
        await interaction.editReply({ embeds: [botInfoEmbed] });
    },
};
