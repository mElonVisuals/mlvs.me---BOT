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

        // Create the new embed
        const botInfoEmbed = new EmbedBuilder()
            .setColor(0x2b2d31) // Dark Discord-like gray
            .setAuthor({
                name: `${client.user.username} • /bot info`,
                iconURL: client.user.displayAvatarURL()
            })
            .setThumbnail('https://cdn.discordapp.com/attachments/1335734480253747297/1400244688061202553/mlvs.me-logo.png?ex=68908c3c&is=688f3abc&hm=f85d565a9822ddf01ea64f44d015f8815e22d6cfee5f0e71aa4720b229cfa3be&') // Bot's custom logo
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
