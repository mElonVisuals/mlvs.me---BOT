/**
 * Server Info Command
 * Displays detailed information about the current Discord server
 */

const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    // Add a category property for organization
    category: 'Information',

    // Command data
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Display detailed information about this server'),

    // Execute function
    async execute(interaction) {
        // The reply is already deferred in the main interactionCreate event handler,
        // so we can proceed with fetching data and building the embed.
        // The line "await interaction.deferReply();" has been removed here.

        const guild = interaction.guild;
        const owner = await guild.fetchOwner();

        // Get server statistics
        const totalMembers = guild.memberCount;
        const botCount = guild.members.cache.filter(member => member.user.bot).size;
        const humanCount = totalMembers - botCount;

        // Get channel counts
        const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
        const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
        const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;

        // Get role count (excluding @everyone)
        const roleCount = guild.roles.cache.size - 1;

        // Get boost information
        const boostLevel = guild.premiumTier;
        const boostCount = guild.premiumSubscriptionCount || 0;

        // Mappings for readability
        const verificationLevels = ['None', 'Low', 'Medium', 'High', 'Highest'];
        const contentFilterLevels = ['Off', 'No Role', 'All Members'];

        // Create the new embed
        const serverInfoEmbed = new EmbedBuilder()
            // Set the color, title, thumbnail, and footer to match your requested style
            .setColor(0x5865F2) // A dark, Discord-like gray
            .setTitle(`Server Info - ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
            .setTimestamp()
            .setFooter({
                text: `${guild.name}`,
                iconURL: guild.iconURL()
            });

        // Add fields for General Info
        serverInfoEmbed.addFields(
            { name: '**__- General:__**', value: ` `, inline: false },
            { name: 'Server ID:', value: `🆔 \`${guild.id}\``, inline: true },
            { name: 'Owner:', value: `👑 <@${owner.id}>`, inline: true },
            { name: 'Created At:', value: `🗓️ <t:${Math.floor(guild.createdAt.getTime() / 1000)}:R>`, inline: true }
        );

        // Add fields for Statistics
        serverInfoEmbed.addFields(
            { name: '\u200b', value: '\u200b', inline: false }, // Adds a clean line break
            { name: '**__- Statistics:__**', value: ` `, inline: false },
            { 
                name: 'Channels:', 
                value: `• Text: ${textChannels}\n• Voice: ${voiceChannels}\n• Categories: ${categories}`, 
                inline: true 
            },
            { 
                name: 'Members:', 
                value: `• Total: ${totalMembers}\n• Humans: ${humanCount}\n• Bots: ${botCount}`, 
                inline: true 
            },
            { 
                name: 'Roles:', 
                value: `• Total: ${roleCount}`, 
                inline: true 
            },
            {
                name: 'Server Boosts:',
                value: `• Level: ${boostLevel}\n• Count: ${boostCount}`,
                inline: true
            },
            {
                name: 'Security:',
                value: `• Verification: ${verificationLevels[guild.verificationLevel]}\n• Content Filter: ${contentFilterLevels[guild.explicitContentFilter]}`,
                inline: true
            }
        );

        // Add server banner as an image if it exists
        if (guild.banner) {
            serverInfoEmbed.setImage(guild.bannerURL({ dynamic: true, size: 1024 }));
        }

        // Add server features if any
        if (guild.features.length > 0) {
            const features = guild.features.map(feature =>
                feature.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            ).join(', ');
            
            serverInfoEmbed.addFields({
                name: '\u200b', // Adds a clean line break
                value: '\u200b',
                inline: false
            }, {
                name: '✨ Server Features',
                value: features,
                inline: false
            });
        }

        // Reply with the final embed
        await interaction.editReply({ embeds: [serverInfoEmbed] });
    },
};
