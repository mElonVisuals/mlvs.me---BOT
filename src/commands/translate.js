// src/commands/translate.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getThemedEmbed } = require('../utils/embedBuilder');
const axios = require('axios'); // Make sure you have 'axios' installed: npm install axios

// List of supported languages for autocomplete (adjust as needed based on API)
// This is a simplified list. A real API might have different codes or a longer list.
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
        const filtered = choices.slice(0, 25); // Discord only allows 25 options
        await interaction.respond(
            filtered.map(choice => ({ name: choice.name, value: choice.value }))
        );
    },

    async execute(interaction) {
        await interaction.deferReply(); // Defer the reply as API calls can take time

        const text = interaction.options.getString('text');
        const toLang = interaction.options.getString('to').toLowerCase();
        const fromLang = interaction.options.getString('from')?.toLowerCase() || 'auto'; // 'auto' for auto-detection

        const apiUrl = process.env.TRANSLATION_API_URL;

        if (!apiUrl) {
            const errorEmbed = getThemedEmbed()
                .setDescription('❌ Translation API URL not configured. Please set `TRANSLATION_API_URL` in `.env`.')
                .setColor('#FF0000');
            return interaction.editReply({ embeds: [errorEmbed] });
        }

        const validToLang = supportedLanguages.some(lang => lang.value === toLang);
        const validFromLang = fromLang === 'auto' || supportedLanguages.some(lang => lang.value === fromLang);

        if (!validToLang) {
            const errorEmbed = getThemedEmbed()
                .setDescription(`❌ Invalid target language code: \`${toLang}\`. Please use a valid language code (e.g., \`en\`, \`es\`).`)
                .setColor('#FF0000');
            return interaction.editReply({ embeds: [errorEmbed] });
        }
        if (!validFromLang) {
            const errorEmbed = getThemedEmbed()
                .setDescription(`❌ Invalid source language code: \`${fromLang}\`. Please use a valid language code or 'auto'.`)
                .setColor('#FF0000');
            return interaction.editReply({ embeds: [errorEmbed] });
        }

        try {
            const response = await axios.post(apiUrl, {
                q: text,
                source: fromLang,
                target: toLang,
                format: 'text',
                api_key: '' // LibreTranslate often doesn't require a key by default for public instances
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            const translatedText = response.data.translatedText;
            const detectedSource = response.data.detectedLanguage?.language || fromLang; // Get detected language if available

            const embed = getThemedEmbed()
                .setTitle('🌍 Text Translated!')
                .addFields(
                    { name: `Original (${detectedSource})`, value: `\`\`\`${text}\`\`\`` },
                    { name: `Translated (${toLang})`, value: `\`\`\`${translatedText}\`\`\`` }
                );

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error translating text:', error.response ? error.response.data : error.message);
            const errorEmbed = getThemedEmbed()
                .setDescription('❌ Failed to translate text. The translation API might be unavailable or rate-limited.')
                .setColor('#FF0000');
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};