// src/commands/shorten.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getThemedEmbed } = require('../utils/embedBuilder'); // <--- THIS LINE IS CRUCIAL
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shorten')
        .setDescription('Shortens a URL using your custom domain (mlvs.me).')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('The URL to shorten')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('custom')
                .setDescription('Optional: Custom short code (e.g., "my-link")')
                .setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply(); // Defer the reply as API calls can take time

        const longUrl = interaction.options.getString('url');
        const customCode = interaction.options.getString('custom');

        const rebrandlyApiKey = process.env.REBRANDLY_API_KEY;
        const shortenerDomain = process.env.SHORTENER_DOMAIN; // This should be 'mlvs.me'

        if (!rebrandlyApiKey || !shortenerDomain) {
            const errorEmbed = getThemedEmbed() // <--- This is the line that's failing if not imported
                .setDescription('❌ URL Shortener API key or domain not configured. Please set `REBRANDLY_API_KEY` and `SHORTENER_DOMAIN` in `.env`.')
                .setColor('#FF0000');
            return interaction.editReply({ embeds: [errorEmbed] });
        }

        // Basic URL validation
        try {
            new URL(longUrl); // Throws if URL is invalid
        } catch (e) {
            const errorEmbed = getThemedEmbed() // <--- This is the line that's failing if not imported
                .setDescription('❌ Invalid URL provided. Please provide a valid link starting with `http://` or `https://`.')
                .setColor('#FF0000');
            return interaction.editReply({ embeds: [errorEmbed] });
        }

        try {
            const data = {
                destination: longUrl,
                domain: { fullName: shortenerDomain },
            };

            if (customCode) {
                data.slashtag = customCode; // For custom codes
            }

            const response = await axios.post('https://api.rebrandly.com/v1/links', data, {
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': rebrandlyApiKey,
                },
            });

            const shortLink = response.data.shortUrl;
            const embed = getThemedEmbed()
                .setTitle('🔗 URL Shortened!')
                .setDescription(`Your long URL has been shortened to:`)
                .addFields(
                    { name: 'Original URL', value: `\`${longUrl}\`` },
                    { name: 'Shortened URL', value: `[${shortLink}](${shortLink})` }
                );

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error shortening URL:', error.response ? error.response.data : error.message);
            let errorMessage = 'Failed to shorten URL. The API might be unavailable or you might have exceeded limits.';
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = `Failed to shorten URL: ${error.response.data.message}`;
                // Specific error for duplicate custom codes
                if (error.response.data.code === 'LinkConflict' && customCode) {
                    errorMessage = `❌ The custom short code \`${customCode}\` is already in use or unavailable. Please try another one.`;
                }
            }
            const errorEmbed = getThemedEmbed() // <--- This is the line that's failing if not imported
                .setDescription(`❌ ${errorMessage}`)
                .setColor('#FF0000');
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};