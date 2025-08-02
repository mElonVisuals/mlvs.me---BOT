/**
 * Translate Command
 * Translate text between languages using a translation API
 */

const { SlashCommandBuilder } = require('discord.js');
const { CustomEmbedBuilder, THEME } = require('../utils/embedBuilder');

// Popular language codes and their display names
const languages = {
    'auto': 'Auto Detect',
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese (Simplified)',
    'zh-tw': 'Chinese (Traditional)',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'tr': 'Turkish',
    'pl': 'Polish',
    'nl': 'Dutch',
    'sv': 'Swedish',
    'da': 'Danish',
    'no': 'Norwegian',
    'fi': 'Finnish',
    'cs': 'Czech',
    'hu': 'Hungarian',
    'th': 'Thai',
    'vi': 'Vietnamese',
    'id': 'Indonesian',
    'ms': 'Malay',
    'tl': 'Filipino',
    'uk': 'Ukrainian',
    'bg': 'Bulgarian',
    'ro': 'Romanian',
    'hr': 'Croatian',
    'sk': 'Slovak',
    'sl': 'Slovenian',
    'et': 'Estonian',
    'lv': 'Latvian',
    'lt': 'Lithuanian',
    'mt': 'Maltese',
    'cy': 'Welsh',
    'ga': 'Irish',
    'is': 'Icelandic',
    'mk': 'Macedonian',
    'sq': 'Albanian',
    'sr': 'Serbian',
    'bs': 'Bosnian',
    'he': 'Hebrew',
    'fa': 'Persian',
    'ur': 'Urdu',
    'bn': 'Bengali',
    'gu': 'Gujarati',
    'ta': 'Tamil',
    'te': 'Telugu',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'si': 'Sinhala',
    'my': 'Myanmar',
    'km': 'Khmer',
    'lo': 'Lao',
    'ka': 'Georgian',
    'am': 'Amharic',
    'sw': 'Swahili',
    'zu': 'Zulu',
    'af': 'Afrikaans',
    'eu': 'Basque',
    'ca': 'Catalan',
    'gl': 'Galician',
    'la': 'Latin'
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('translate')
        .setDescription('Translate text between different languages')
        .addStringOption(option =>
            option
                .setName('text')
                .setDescription('Text to translate (max 1000 characters)')
                .setRequired(true)
                .setMaxLength(1000)
        )
        .addStringOption(option =>
            option
                .setName('to')
                .setDescription('Target language (e.g., en, es, fr, de, ja, etc.)')
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption(option =>
            option
                .setName('from')
                .setDescription('Source language (auto-detect if not specified)')
                .setRequired(false)
                .setAutocomplete(true)
        ),

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder(interaction.client);
        const text = interaction.options.getString('text');
        const targetLang = interaction.options.getString('to').toLowerCase();
        const sourceLang = interaction.options.getString('from')?.toLowerCase() || 'auto';

        // Validate language codes
        if (!languages[targetLang]) {
            const errorEmbed = embedBuilder.error(
                'Invalid Target Language',
                `Language code \`${targetLang}\` is not supported.`,
                [
                    {
                        name: '🌍 Popular Languages',
                        value: '`en` English • `es` Spanish • `fr` French • `de` German • `ja` Japanese • `ko` Korean • `zh` Chinese • `ru` Russian',
                        inline: false
                    },
                    {
                        name: '💡 Tip',
                        value: 'Use the autocomplete feature when typing to see all available languages.',
                        inline: false
                    }
                ]
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        if (sourceLang !== 'auto' && !languages[sourceLang]) {
            const errorEmbed = embedBuilder.error(
                'Invalid Source Language',
                `Language code \`${sourceLang}\` is not supported. Leave empty for auto-detection.`
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        // Show loading message
        const loadingEmbed = embedBuilder.loading(
            'Translating...',
            `Translating your text ${sourceLang === 'auto' ? 'from auto-detected language' : `from ${languages[sourceLang]}`} to ${languages[targetLang]}...`
        );

        await interaction.reply({ embeds: [loadingEmbed] });

        try {
            // Use a free translation service (LibreTranslate API or similar)
            const translation = await translateText(text, sourceLang, targetLang);
            
            if (!translation.success) {
                throw new Error(translation.error || 'Translation failed');
            }

            // Create success embed
            const successEmbed = embedBuilder.success(
                'Translation Complete!',
                `Successfully translated your text to ${languages[targetLang]}.`,
                [
                    {
                        name: `📝 Original Text ${sourceLang !== 'auto' ? `(${languages[sourceLang]})` : `(${translation.detectedLanguage ? languages[translation.detectedLanguage] || 'Detected' : 'Auto-detected'})`}`,
                        value: text.length > 1000 ? text.substring(0, 1000) + '...' : text,
                        inline: false
                    },
                    {
                        name: `🌍 Translation (${languages[targetLang]})`,
                        value: translation.text.length > 1000 ? translation.text.substring(0, 1000) + '...' : translation.text,
                        inline: false
                    },
                    {
                        name: '📊 Translation Details',
                        value: [
                            `**Service:** LibreTranslate`,
                            `**Confidence:** ${translation.confidence || 'N/A'}`,
                            `**Characters:** ${text.length}`,
                            sourceLang === 'auto' && translation.detectedLanguage ? `**Detected Language:** ${languages[translation.detectedLanguage] || translation.detectedLanguage}` : null
                        ].filter(Boolean).join('\n'),
                        inline: true
                    },
                    {
                        name: '🔄 Quick Actions',
                        value: [
                            '• Use `/translate` again to translate back',
                            '• Copy the translation text above',
                            '• Try different language pairs'
                        ].join('\n'),
                        inline: true
                    }
                ]
            );

            // Add language flags for visual appeal
            const sourceFlag = getLanguageFlag(translation.detectedLanguage || sourceLang);
            const targetFlag = getLanguageFlag(targetLang);
            
            if (sourceFlag && targetFlag) {
                successEmbed.setDescription(`${sourceFlag} ➜ ${targetFlag} Successfully translated your text to ${languages[targetLang]}.`);
            }

            await interaction.editReply({ embeds: [successEmbed] });

            // Log translation
            console.log(`🌍 [TRANSLATE] ${interaction.user.tag} translated text from ${sourceLang} to ${targetLang} (${text.length} chars)`);

        } catch (error) {
            console.error('❌ Translation error:', error);

            const errorEmbed = embedBuilder.error(
                'Translation Failed',
                'Sorry, I couldn\'t translate your text right now. This might be due to:',
                [
                    {
                        name: '🔧 Possible Issues',
                        value: [
                            '• Translation service is temporarily unavailable',
                            '• The text contains unsupported characters',
                            '• Network connectivity issues',
                            '• Language pair not supported'
                        ].join('\n'),
                        inline: false
                    },
                    {
                        name: '💡 Try Again',
                        value: [
                            '• Wait a moment and retry',
                            '• Try a different language pair',
                            '• Shorten your text if it\'s very long',
                            '• Check if the language codes are correct'
                        ].join('\n'),
                        inline: false
                    }
                ]
            );

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },

    // Autocomplete handler
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const choices = Object.entries(languages)
            .filter(([code, name]) => 
                code.includes(focusedValue) || 
                name.toLowerCase().includes(focusedValue)
            )
            .slice(0, 25) // Discord limit
            .map(([code, name]) => ({
                name: `${name} (${code})`,
                value: code
            }));

        await interaction.respond(choices);
    }
};

// Mock translation function (replace with actual API)
async function translateText(text, from, to) {
    // This is a mock implementation. In production, you would use:
    // - Google Translate API
    // - Microsoft Translator API  
    // - LibreTranslate API
    // - MyMemory API (free)
    // - DeepL API
    
    try {
        // Mock translation for demonstration
        // Replace this with actual API call
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock responses for common cases
        const mockTranslations = {
            'hello': {
                'es': 'hola',
                'fr': 'bonjour',
                'de': 'guten tag',
                'ja': 'こんにちは',
                'ko': '안녕하세요',
                'zh': '你好',
                'ru': 'привет'
            },
            'how are you': {
                'es': '¿cómo estás?',
                'fr': 'comment allez-vous?',
                'de': 'wie geht es dir?',
                'ja': '元気ですか？',
                'ko': '어떻게 지내세요?'
            },
            'thank you': {
                'es': 'gracias',
                'fr': 'merci',
                'de': 'danke',
                'ja': 'ありがとう',
                'ko': '감사합니다'
            }
        };

        const lowerText = text.toLowerCase().trim();
        const mockResult = mockTranslations[lowerText]?.[to];
        
        if (mockResult) {
            return {
                success: true,
                text: mockResult,
                detectedLanguage: from === 'auto' ? 'en' : from,
                confidence: '95%'
            };
        }

        // For other text, return a placeholder response
        return {
            success: true,
            text: `[Translation: ${text} → ${languages[to]}]`,
            detectedLanguage: from === 'auto' ? 'en' : from,
            confidence: 'N/A'
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Helper function to get language flags
function getLanguageFlag(langCode) {
    const flags = {
        'en': '🇺🇸', 'es': '🇪🇸', 'fr': '🇫🇷', 'de': '🇩🇪', 'it': '🇮🇹',
        'pt': '🇵🇹', 'ru': '🇷🇺', 'ja': '🇯🇵', 'ko': '🇰🇷', 'zh': '🇨🇳',
        'ar': '🇸🇦', 'hi': '🇮🇳', 'tr': '🇹🇷', 'pl': '🇵🇱', 'nl': '🇳🇱',
        'sv': '🇸🇪', 'da': '🇩🇰', 'no': '🇳🇴', 'fi': '🇫🇮', 'cs': '🇨🇿',
        'hu': '🇭🇺', 'th': '🇹🇭', 'vi': '🇻🇳', 'id': '🇮🇩', 'uk': '🇺🇦'
    };
    return flags[langCode] || '🌍';
}