// src/commands/translate.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { CustomEmbedBuilder, THEME } = require('../utils/embedBuilder'); // <--- IMPORT THE CLASS AND THEME
const axios = require('axios');

// List of supported languages for autocomplete (adjust as needed based on API)
const supportedLanguages = [
    { name: 'English', value: 'en' },
    { name: 'Spanish', value: 'es' },
    { name: 'French', value: 'fr' },
    { name: 'German', value: 'de' },
    { name: 'Italian', value: 'it' },
    { name: 'Portuguese', value: 'pt' },
    { name: 'Russian', value: 'ru' },
    { name: 'Chinese (Simplified)', value: 'zh' },
    { name: 'Japanese', value: 'ja' },
    { name: 'Korean', value: 'ko' },
    { name: 'Arabic', value: 'ar' },
    { name: 'Hindi', value: 'hi' },
    { name: 'Bengali', value: 'bn' },
    { name: 'Vietnamese', value: 'vi' },
    { name: 'Turkish', value: 'tr' },
    { name: 'Polish', value: 'pl' },
    { name: 'Dutch', value: 'nl' },
    { name: 'Swedish', value: 'sv' },
    // Add more as supported by your chosen API
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('translate')
        .setDescription('Translates text to a specified language.')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('The text to translate (max 1000 characters)')
                .setRequired(true)
                .setMaxLength(1000))
        .addStringOption(option =>
            option.setName('to')
                .setDescription('The target language (e.g., en, es, fr)')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option =>
            option.setName('from')
                .setDescription('Optional: The source language (e.g., en, es, fr - auto-detect if not specified)')
                .setRequired(false)
                .setAutocomplete(true)),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const choices = supportedLanguages.filter(lang =>
            lang.name.toLowerCase().includes(focusedValue.toLowerCase()) ||
            lang.value.toLowerCase().includes(focusedValue.toLowerCase())
        );
        const filtered = choices.slice(0, 25);
        await interaction.respond(
            filtered.map(choice => ({ name: choice.name, value: choice.value }))
        );
    },

    async execute(interaction) {
        // --- NEW CODE START ---
        // Create a new instance of CustomEmbedBuilder for this interaction
        const embedBuilder = new CustomEmbedBuilder(interaction.client);
        // --- NEW CODE END ---

        await interaction.deferReply();

        const text = interaction.options.getString('text');
        const toLang = interaction.options.getString('to').toLowerCase();
        const fromLang = interaction.options.getString('from')?.toLowerCase() || 'auto';

        const apiUrl = process.env.TRANSLATION_API_URL;

        if (!apiUrl) {
            // Use the instance's error method
            const errorEmbed = embedBuilder.error(
                'Configuration Error',
                'Translation API URL not configured. Please set `TRANSLATION_API_URL` in `.env`.'
            );
            return interaction.editReply({ embeds: [errorEmbed] });
        }

        const validToLang = supportedLanguages.some(lang => lang.value === toLang);
        const validFromLang = fromLang === 'auto' || supportedLanguages.some(lang => lang.value === fromLang);

        if (!validToLang) {
            // Use the instance's error method
            const errorEmbed = embedBuilder.error(
                'Invalid Language',
                `Invalid target language code: \`${toLang}\`. Please use a valid language code (e.g., \`en\`, \`es\`).`
            );
            return interaction.editReply({ embeds: [errorEmbed] });
        }
        if (!validFromLang) {
            // Use the instance's error method
            const errorEmbed = embedBuilder.error(
                'Invalid Language',
                `Invalid source language code: \`${fromLang}\`. Please use a valid language code or 'auto'.`
            );
            return interaction.editReply({ embeds: [errorEmbed] });
        }

        try {
            const response = await axios.post(apiUrl, {
                q: text,
                source: fromLang,
                target: toLang,
                format: 'text',
                api_key: ''
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            const translatedText = response.data.translatedText;
            const detectedSource = response.data.detectedLanguage?.language || fromLang;

            // Use the instance's createBaseEmbed method and customize
            const embed = embedBuilder.createBaseEmbed('info') // Use 'info' for info type
                .setTitle(`${THEME.emojis.info} Text Translated!`) // Incorporate info emoji from THEME
                .addFields(
                    { name: `Original (${detectedSource})`, value: `\`\`\`${text}\`\`\`` },
                    { name: `Translated (${toLang})`, value: `\`\`\`${translatedText}\`\`\`` }
                );

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error translating text:', error.response ? error.response.data : error.message);
            // Use the instance's error method
            const errorEmbed = embedBuilder.error(
                'Translation Failed',
                'Failed to translate text. The translation API might be unavailable or rate-limited.'
            );
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};