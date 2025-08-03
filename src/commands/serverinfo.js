/**
 * Server Info Command
 * Displays detailed information about the current Discord server
 */

const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    // Command data
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Display detailed information about this server'),

    // Execute function
    async execute(interaction) {
        // Defer the reply to give the bot time to process the command
        await interaction.deferReply();

        const guild = interaction.guild;

        // Get server statistics
        const totalMembers = guild.memberCount;
        const botCount = guild.members.cache.filter(member => member.user.bot).size;
        const humanCount = totalMembers - botCount;

        // Get channel counts
        const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
        const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
        const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;
        const totalChannels = guild.channels.cache.size;

        // Get role count (excluding @everyone)
        const roleCount = guild.roles.cache.size - 1;

        // Get boost information
        const boostLevel = guild.premiumTier;
        const boostCount = guild.premiumSubscriptionCount || 0;

        // Get creation date
        const createdAt = guild.createdAt;

        // Mappings for readability
        const verificationLevels = ['None', 'Low', 'Medium', 'High', 'Highest'];
        const contentFilterLevels = ['Off', 'No Role', 'All Members'];

        // Create the new embed
        const serverInfoEmbed = new EmbedBuilder()
            // Set the color, title, thumbnail, and footer to match the requested style
            .setColor(0x2b2d31) // A dark, Discord-like gray
            .setTitle(`Server Info - ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
            .setTimestamp()
            .setFooter({
                text: `${guild.name}`,
                iconURL: guild.iconURL()
            });

        // ====================================================================
        //                       General Section
        // ====================================================================
        const generalFields = [
            // Section header
            { name: '**__- General:__**', value: '\u200b', inline: false },
            { name: 'Server ID:', value: `🆔 \`${guild.id}\``, inline: true },
            { name: 'Owner:', value: `👑 <@${guild.ownerId}>`, inline: true },
            { name: '\u200b', value: '\u200b', inline: true }, // Spacer
            {
                name: 'Created At:',
                value: `🗓️ <t:${Math.floor(createdAt.getTime() / 1000)}:R>`,
                inline: true
            },
            {
                name: 'Members:',
                value: `👥 ${totalMembers}`,
                inline: true
            },
            { name: '\u200b', value: '\u200b', inline: true }, // Spacer
        ];

        // ====================================================================
        //                       Statistics Section
        // ====================================================================
        const statisticsFields = [
            // Section header
            { name: '\u200b', value: '\u200b', inline: false }, // Spacer
            { name: '**__- Statistics:__**', value: '\u200b', inline: false },
            {
                name: 'Counts:',
                value: `**Text Channels:** ${textChannels}\n` +
                       `**Voice Channels:** ${voiceChannels}\n` +
                       `**Roles:** ${roleCount}\n` +
                       `**Categories:** ${categories}`,
                inline: true
            },
            {
                name: 'Server Boosts:',
                value: `⭐ **Level:** ${boostLevel}\n` +
                       `**Count:** ${boostCount}`,
                inline: true
            },
            { name: '\u200b', value: '\u200b', inline: true }, // Spacer
            {
                name: 'Security:',
                value: `🛡️ **Verification:** ${verificationLevels[guild.verificationLevel]}\n` +
                       `**Content Filter:** ${contentFilterLevels[guild.explicitContentFilter]}`,
                inline: true
            },
            {
                name: 'Members:',
                value: `👥 **Humans:** ${humanCount}\n` +
                       `**Bots:** ${botCount}`,
                inline: true
            },
        ];
        
        // Add server banner as an image if it exists
        if (guild.banner) {
            serverInfoEmbed.setImage(guild.bannerURL({ dynamic: true, size: 1024 }));
        }

        // Add server features if any
        if (guild.features.length > 0) {
            const features = guild.features.map(feature =>
                feature.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            ).join(', ');
            
            // Add a field for server features
            statisticsFields.push({
                name: '\u200b', // Spacer to ensure new line
                value: '\u200b',
                inline: false
            }, {
                name: '✨ Server Features',
                value: features,
                inline: false
            });
        }

        // Combine and add all fields to the embed
        serverInfoEmbed.addFields(...generalFields, ...statisticsFields);

        // Reply with the final embed
        await interaction.editReply({ embeds: [serverInfoEmbed] });
    },
};
