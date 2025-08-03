/**
 * User Info Command
 * Displays detailed information about a user.
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const moment = require('moment'); // Make sure you have this library installed

module.exports = {
    category: 'Information',
    
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Displays information about a user or yourself')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to get info about (defaults to you)')
                .setRequired(false)),

    async execute(interaction) {
        // Defer the reply immediately to prevent a timeout.
        await interaction.deferReply();
        
        const user = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild.members.cache.get(user.id);
        
        if (!member) {
            await interaction.editReply({ content: 'I could not find that user in this server.', ephemeral: true });
            return;
        }

        const infoEmbed = new EmbedBuilder()
            .setColor(member.displayHexColor !== '#000000' ? member.displayHexColor : '#0099ff')
            .setTitle(`User Info for ${user.username}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .addFields(
                { name: 'User Tag:', value: `\`${user.tag}\``, inline: true },
                { name: 'User ID:', value: `\`${user.id}\``, inline: true },
                { name: '\u200B', value: '\u200B', inline: true }, // Empty field for spacing
                { name: 'Joined Discord:', value: moment(user.createdAt).format('LL'), inline: true },
                { name: 'Joined Server:', value: moment(member.joinedAt).format('LL'), inline: true },
                { name: '\u200B', value: '\u200B', inline: true }, // Empty field for spacing
                { name: 'Roles:', value: member.roles.cache.size > 1 ? member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => r.toString()).join(', ') : 'None', inline: false },
                { name: 'Highest Role:', value: member.roles.highest.toString(), inline: true },
                { name: 'Is Bot:', value: user.bot ? 'Yes' : 'No', inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.tag}` });

        await interaction.editReply({ embeds: [infoEmbed] });
    },
};
