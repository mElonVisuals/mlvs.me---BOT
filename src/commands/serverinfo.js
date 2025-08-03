// src/commands/serverinfo.js

const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { CustomEmbedBuilder, THEME } = require('../utils/embedBuilder');

module.exports = {
    // Add a category property
    category: 'Utility',

    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Display detailed information about this server'),

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder(interaction.client);
        const guild = interaction.guild;

        const totalMembers = guild.memberCount;
        const botCount = guild.members.cache.filter(member => member.user.bot).size;
        const humanCount = totalMembers - botCount;

        const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
        const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
        const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;
        const totalChannels = guild.channels.cache.size;

        const roleCount = guild.roles.cache.size - 1;

        const boostLevel = guild.premiumTier;
        const boostCount = guild.premiumSubscriptionCount || 0;

        const verificationLevels = [ 'None', 'Low', 'Medium', 'High', 'Highest' ];
        const contentFilterLevels = ['Off', 'No Role', 'Everyone'];
        
        const createdAt = guild.createdAt;
        const serverAge = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

        const serverInfoEmbed = embedBuilder.info(
            `${THEME.emojis.star} Server Info for ${guild.name}`,
            `A detailed overview of the server.`
        )
        .addFields(
            [
                {
                    name: '👥 Members',
                    value: `**Total:** ${totalMembers}\n**Humans:** ${humanCount}\n**Bots:** ${botCount}`,
                    inline: true
                },
                {
                    name: '💬 Channels',
                    value: `**Text:** ${textChannels}\n**Voice:** ${voiceChannels}\n**Categories:** ${categories}\n**Total:** ${totalChannels}`,
                    inline: true
                },
                {
                    name: '🚀 Server Boost',
                    value: `**Level:** ${boostLevel}\n**Boosts:** ${boostCount}`,
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
        .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }) || null)
        .setImage(guild.bannerURL({ dynamic: true, size: 1024 }) || null);

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
