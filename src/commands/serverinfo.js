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

        // Get creation date
        const createdAt = guild.createdAt;
        const serverAge = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

        // Mappings for readability
        const verificationLevels = ['None', 'Low', 'Medium', 'High', 'Highest'];
        const contentFilterLevels = ['Off', 'No Role', 'All Members'];

        const serverInfoEmbed = embedBuilder.info(
            `Server Info for ${guild.name}`,
            `A detailed overview of the server's key statistics.`,
            [
                {
                    name: '👥 Members',
                    value: [
                        `**Total:** ${totalMembers}`,
                        `**Humans:** ${humanCount}`,
                        `**Bots:** ${botCount}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '📜 Channels',
                    value: [
                        `**Total:** ${totalChannels}`,
                        `**Text:** ${textChannels}`,
                        `**Voice:** ${voiceChannels}`,
                        `**Categories:** ${categories}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '⭐ Boosts',
                    value: [
                        `**Level:** ${boostLevel}`,
                        `**Count:** ${boostCount}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '🎭 Roles',
                    value: `**Total:** ${roleCount}`,
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
        // Use placeholders if the guild icon or banner is not available
        .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }) || embedBuilder.getPlaceholder('serverIcon'))
        .setImage(guild.bannerURL({ dynamic: true, size: 1024 }) || embedBuilder.getPlaceholder('banner'));

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
