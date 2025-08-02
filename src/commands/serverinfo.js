/**
 * Server Info Command
 * Displays detailed information about the current Discord server
 */

const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { CustomEmbedBuilder, THEME } = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Display detailed information about this server'),

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder(interaction.client);
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

        // Get verification level
        const verificationLevels = {
            0: 'None',
            1: 'Low',
            2: 'Medium',
            3: 'High',
            4: 'Very High'
        };

        // Get explicit content filter level
        const contentFilterLevels = {
            0: 'Disabled',
            1: 'Members without roles',
            2: 'All members'
        };

        // Calculate server age
        const createdAt = guild.createdAt;
        const serverAge = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

        const serverInfoEmbed = embedBuilder.info(
            `${guild.name} Server Information`,
            `Here's everything you need to know about **${guild.name}**`,
            [
                {
                    name: '👥 Members',
                    value: [
                        `**Total:** ${totalMembers.toLocaleString()}`,
                        `**Humans:** ${humanCount.toLocaleString()}`,
                        `**Bots:** ${botCount.toLocaleString()}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '📝 Channels',
                    value: [
                        `**Total:** ${totalChannels}`,
                        `**Text:** ${textChannels}`,
                        `**Voice:** ${voiceChannels}`,
                        `**Categories:** ${categories}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '🎭 Roles',
                    value: `**${roleCount}** roles`,
                    inline: true
                },
                {
                    name: '🚀 Nitro Boosts',
                    value: [
                        `**Level:** ${boostLevel}`,
                        `**Boosts:** ${boostCount}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '🛡️ Security',
                    value: [
                        `**Verification:** ${verificationLevels[guild.verificationLevel]}`,
                        `**Content Filter:** ${contentFilterLevels[guild.explicitContentFilter]}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '📅 Server Details',
                    value: [
                        `**Created:** <t:${Math.floor(createdAt.getTime() / 1000)}:F>`,
                        `**Age:** ${serverAge} days`,
                        `**Owner:** <@${guild.ownerId}>`
                    ].join('\n'),
                    inline: true
                }
            ]
        )
        .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }) || null)
        .setImage(guild.bannerURL({ dynamic: true, size: 1024 }) || null);

        // Add server features if any
        if (guild.features.length > 0) {
            const features = guild.features.map(feature => 
                feature.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            ).join(', ');
            
            serverInfoEmbed.addFields({
                name: '✨ Server Features',
                value: features,
                inline: false
            });
        }

        await interaction.reply({ embeds: [serverInfoEmbed] });
    },
};