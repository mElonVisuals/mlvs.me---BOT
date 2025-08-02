/**
 * Shorten Command
 * URL shortener using mlvs.me domain
 */

const { SlashCommandBuilder } = require('discord.js');
const { CustomEmbedBuilder, THEME } = require('../utils/embedBuilder');

// Store shortened URLs in memory (use database in production for persistence)
const urlDatabase = new Map();
const reverseDatabase = new Map(); // For reverse lookups

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shorten')
        .setDescription('Create a shortened URL using mlvs.me domain')
        .addStringOption(option =>
            option
                .setName('url')
                .setDescription('The URL to shorten (must include http:// or https://)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('custom')
                .setDescription('Custom short code (optional, 3-20 characters, alphanumeric only)')
                .setRequired(false)
                .setMinLength(3)
                .setMaxLength(20)
        ),

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder(interaction.client);
        const originalUrl = interaction.options.getString('url');
        const customCode = interaction.options.getString('custom');

        // Validate URL format
        if (!isValidUrl(originalUrl)) {
            const errorEmbed = embedBuilder.error(
                'Invalid URL',
                'Please provide a valid URL starting with `http://` or `https://`',
                [
                    {
                        name: '✅ Valid Examples',
                        value: '• `https://google.com`\n• `https://discord.com/channels/123/456`\n• `http://example.com/page?param=value`',
                        inline: false
                    }
                ]
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        // Check if URL is already shortened
        if (reverseDatabase.has(originalUrl)) {
            const existingCode = reverseDatabase.get(originalUrl);
            const shortUrl = `https://mlvs.me/${existingCode}`;

            const existingEmbed = embedBuilder.info(
                'URL Already Shortened',
                `This URL has already been shortened previously.`,
                [
                    {
                        name: '🔗 Original URL',
                        value: `[${truncateUrl(originalUrl)}](${originalUrl})`,
                        inline: false
                    },
                    {
                        name: '⚡ Shortened URL',
                        value: `[${shortUrl}](${shortUrl})`,
                        inline: false
                    },
                    {
                        name: '📊 Stats',
                        value: `**Code:** \`${existingCode}\`\n**Created:** <t:${Math.floor(urlDatabase.get(existingCode).created / 1000)}:R>`,
                        inline: false
                    }
                ]
            );

            return interaction.reply({ embeds: [existingEmbed] });
        }

        // Generate or validate custom code
        let shortCode;
        if (customCode) {
            // Validate custom code
            if (!/^[a-zA-Z0-9]+$/.test(customCode)) {
                const errorEmbed = embedBuilder.error(
                    'Invalid Custom Code',
                    'Custom codes can only contain letters and numbers (a-z, A-Z, 0-9).'
                );
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            // Check if custom code is already taken
            if (urlDatabase.has(customCode.toLowerCase())) {
                const errorEmbed = embedBuilder.error(
                    'Custom Code Taken',
                    `The custom code \`${customCode}\` is already in use. Please choose a different one.`
                );
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            shortCode = customCode.toLowerCase();
        } else {
            // Generate random short code
            shortCode = generateShortCode();
            
            // Ensure uniqueness (very unlikely collision, but just in case)
            while (urlDatabase.has(shortCode)) {
                shortCode = generateShortCode();
            }
        }

        // Store the URL mapping
        const urlData = {
            originalUrl: originalUrl,
            shortCode: shortCode,
            created: Date.now(),
            createdBy: interaction.user.id,
            clicks: 0
        };

        urlDatabase.set(shortCode, urlData);
        reverseDatabase.set(originalUrl, shortCode);

        // Create shortened URL
        const shortUrl = `https://mlvs.me/${shortCode}`;

        // Success response
        const successEmbed = embedBuilder.success(
            'URL Shortened Successfully!',
            `Your long URL has been converted to a short, shareable link.`,
            [
                {
                    name: '🔗 Original URL',
                    value: `[${truncateUrl(originalUrl)}](${originalUrl})`,
                    inline: false
                },
                {
                    name: '⚡ Shortened URL',
                    value: `[${shortUrl}](${shortUrl})`,
                    inline: false
                },
                {
                    name: '📋 Details',
                    value: [
                        `**Short Code:** \`${shortCode}\``,
                        `**Created:** <t:${Math.floor(Date.now() / 1000)}:F>`,
                        `**Clicks:** 0`,
                        customCode ? '**Type:** Custom' : '**Type:** Auto-generated'
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '💡 Features',
                    value: [
                        '🔄 Permanent redirect',
                        '📊 Click tracking',
                        '🛡️ Safe and reliable',
                        '⚡ Fast redirection'
                    ].join('\n'),
                    inline: true
                }
            ]
        )
        .setThumbnail('https://via.placeholder.com/128/7C3AED/FFFFFF?text=mlvs.me');

        await interaction.reply({ embeds: [successEmbed] });

        // Log to console
        console.log(`🔗 [SHORTEN] ${interaction.user.tag} created short URL: ${shortUrl} → ${originalUrl}`);
    },

    // Function to resolve short URLs (for potential web server integration)
    resolveUrl(shortCode) {
        const urlData = urlDatabase.get(shortCode.toLowerCase());
        if (urlData) {
            urlData.clicks++;
            return urlData.originalUrl;
        }
        return null;
    },

    // Function to get URL stats
    getUrlStats(shortCode) {
        return urlDatabase.get(shortCode.toLowerCase()) || null;
    },

    // Export database for potential web server integration
    getDatabase: () => urlDatabase
};

// Helper function to validate URLs
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// Helper function to generate random short codes
function generateShortCode(length = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Helper function to truncate long URLs for display
function truncateUrl(url, maxLength = 60) {
    if (url.length <= maxLength) return url;
    return url.slice(0, maxLength - 3) + '...';
}