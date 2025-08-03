/**
 * @file embedBuilder.js
 * @description A custom class for building standardized Discord embeds with consistent styling.
 * This class ensures a uniform look and feel for all bot messages.
 * It's structured to be easily extended with new methods for different embed types.
 */

const { EmbedBuilder } = require('discord.js');

// Get the version directly from the package.json file
const { version } = require('../../package.json');

// Bot theme configuration
const THEME = {
    colors: {
        primary: 0x7C3AED,    // Purple
        success: 0x10B981,    // Green
        error: 0xEF4444,      // Red
        warning: 0xF59E0B,    // Yellow
        info: 0x3B82F6        // Blue
    },
    emojis: {
        // Replace these with your actual custom emoji IDs
        // It's a good practice to include a fallback for guilds where the emoji might not exist.
        success: '<:tick:1400984418004504596>',
        error: '<:error:1400984416133840957>',
        loading: '<a:loading:1400984419350876161>',
        info: '<:info1:1400984414325837975>',
        star: '<a:star_spin:1400984411935346698>',
        ping: '<a:alert:1400984409607507978>',
        warning: '⚠️' // Using a Unicode emoji as a fallback/alternative
    },
    // Placeholder image URLs for when assets are missing, to prevent errors
    placeholders: {
        banner: 'https://via.placeholder.com/400x100/7C3AED/FFFFFF?text=mlvs.me',
        avatar: 'https://via.placeholder.com/256x256/7C3AED/FFFFFF?text=USER',
        serverIcon: 'https://via.placeholder.com/256x256/7C3AED/FFFFFF?text=SERVER',
        botIcon: 'https://via.placeholder.com/256x256/7C3AED/FFFFFF?text=BOT'
    }
};

class CustomEmbedBuilder {
    constructor(client) {
        this.client = client;
    }

    /**
     * Creates a base embed with common settings like color, author, timestamp, and footer.
     * @param {string} type The type of embed ('primary', 'success', 'error', etc.).
     * @returns {EmbedBuilder} A new EmbedBuilder instance with base settings.
     */
    createBaseEmbed(type = 'primary') {
        const color = THEME.colors[type] || THEME.colors.primary;
        
        return new EmbedBuilder()
            .setColor(color)
            .setAuthor({ 
                name: this.client.user.username,
                iconURL: this.client.user.displayAvatarURL()
            })
            .setTimestamp()
            .setFooter({ text: `${this.client.user.username} v${version} • mlvs.me` });
    }
    
    /**
     * Creates a success embed with a green theme and a success emoji.
     * @param {string} title The title of the embed.
     * @param {string} description The description of the embed.
     * @param {Array<object>} [fields=[]] An optional array of field objects to add to the embed.
     * @returns {EmbedBuilder} A styled success embed.
     */
    success(title, description, fields = []) {
        return this.createBaseEmbed('success')
            .setTitle(`${THEME.emojis.success} ${title}`)
            .setDescription(description || null)
            .addFields(fields);
    }

    /**
     * Creates an error embed with a red theme and an error emoji.
     * @param {string} title The title of the embed.
     * @param {string} description The description of the embed.
     * @param {Array<object>} [fields=[]] An optional array of field objects to add to the embed.
     * @returns {EmbedBuilder} A styled error embed.
     */
    error(title, description, fields = []) {
        return this.createBaseEmbed('error')
            .setTitle(`${THEME.emojis.error} ${title}`)
            .setDescription(description || null)
            .addFields(fields);
    }

    /**
     * Creates an info embed with a blue theme and an info emoji.
     * @param {string} title The title of the embed.
     * @param {string} description The description of the embed.
     * @param {Array<object>} [fields=[]] An optional array of field objects to add to the embed.
     * @returns {EmbedBuilder} A styled info embed.
     */
    info(title, description, fields = []) {
        return this.createBaseEmbed('info')
            .setTitle(`${THEME.emojis.info} ${title}`)
            .setDescription(description || null)
            .addFields(fields);
    }

    /**
     * Creates a warning embed with a yellow theme and a warning emoji.
     * @param {string} title The title of the embed.
     * @param {string} description The description of the embed.
     * @param {Array<object>} [fields=[]] An optional array of field objects to add to the embed.
     * @returns {EmbedBuilder} A styled warning embed.
     */
    warning(title, description, fields = []) {
        return this.createBaseEmbed('warning')
            .setTitle(`${THEME.emojis.warning} ${title}`)
            .setDescription(description || null)
            .addFields(fields);
    }

    /**
     * Creates a loading embed with an info theme and a loading emoji.
     * @param {string} title The title of the embed.
     * @param {string} description The description of the embed.
     * @returns {EmbedBuilder} A styled loading embed.
     */
    loading(title, description) {
        return this.createBaseEmbed('info')
            .setTitle(`${THEME.emojis.loading} ${title}`)
            .setDescription(description || null);
    }

    /**
     * Gets a placeholder image URL for a given type.
     * @param {string} type The type of placeholder to get (e.g., 'banner', 'avatar').
     * @returns {string|null} The URL of the placeholder image or null if not found.
     */
    getPlaceholder(type) {
        return THEME.placeholders[type] || null;
    }
}

module.exports = { CustomEmbedBuilder, THEME };
