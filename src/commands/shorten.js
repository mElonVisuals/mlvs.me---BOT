// src/commands/shorten.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { CustomEmbedBuilder, THEME } = require('../utils/embedBuilder'); // <--- IMPORT THE CLASS AND THEME
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
        // --- NEW CODE START ---
        // Create a new instance of CustomEmbedBuilder for this interaction
        const embedBuilder = new CustomEmbedBuilder(interaction.client);
        // --- NEW CODE END ---

        await interaction.deferReply();

        const longUrl = interaction.options.getString('url');
        const customCode = interaction.options.getString('custom');

        const rebrandlyApiKey = process.env.REBRANDLY_API_KEY;
        const shortenerDomain = process.env.SHORTENER_DOMAIN;

        if (!rebrandlyApiKey || !shortenerDomain) {
            // Use the instance's error method
            const errorEmbed = embedBuilder.error(
                'Configuration Error',
                'URL Shortener API key or domain not configured. Please set `REBRANDLY_API_KEY` and `SHORTENER_DOMAIN` in `.env`.'
            );
            return interaction.editReply({ embeds: [errorEmbed] });
        }

        // Basic URL validation
        try {
            new URL(longUrl);
        } catch (e) {
            // Use the instance's error method
            const errorEmbed = embedBuilder.error(
                'Invalid URL',
                'Invalid URL provided. Please provide a valid link starting with `http://` or `https://`.'
            );
            return interaction.editReply({ embeds: [errorEmbed] });
        }

        try {
            const data = {
                destination: longUrl,
                domain: { fullName: shortenerDomain },
            };

            if (customCode) {
                data.slashtag = customCode;
            }

            const response = await axios.post('https://api.rebrandly.com/v1/links', data, {
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': rebrandlyApiKey,
                },
            });

            const shortLink = response.data.shortUrl;
            // Use the instance's createBaseEmbed method
            const embed = embedBuilder.createBaseEmbed('success') // Use 'success' for successful operations
                .setTitle(`${THEME.emojis.success} URL Shortened!`) // Incorporate success emoji from THEME
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
                if (error.response.data.code === 'LinkConflict' && customCode) {
                    errorMessage = `❌ The custom short code \`${customCode}\` is already in use or unavailable. Please try another one.`;
                }
            }
            // Use the instance's error method
            const errorEmbed = embedBuilder.error(
                'Shortening Failed',
                errorMessage
            );
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};