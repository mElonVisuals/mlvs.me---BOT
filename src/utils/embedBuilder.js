/**
 * Embed Builder Utility
 * Creates consistent, themed embeds for the bot
 */

const { EmbedBuilder } = require('discord.js');

// Get the version directly from the package.json file
const { version } = require('../../package.json');

// Bot theme configuration
const THEME = {
    colors: {
        primary: 0x7C3AED,    // Purple
        success: 0x10B981,    // Green
        error: 0xEF4444,      // Red
        warning: 0xF59E0B,    // Yellow
        info: 0x3B82F6      // Blue
    },
    emojis: {
        // Replace these with your actual custom emoji IDs
        success: '<:tick:1400984418004504596>',
        error: '<:error:1400984416133840957>',
        loading: '<a:loading:1400984419350876161>',
        info: '<:info1:1400984414325837975>',
        star: '<a:star_spin:1400984411935346698>',
        ping: '<a:alert:1400984409607507978> '
    },
    // New placeholder image URLs for when assets are missing
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
     * Creates a base embed with common settings
     */
    createBaseEmbed(type = 'primary') {
        let color = THEME.colors[type] || THEME.colors.primary;
        
        return new EmbedBuilder()
            .setColor(color)
            .setAuthor({ 
                name: this.client.user.username,
                iconURL: this.client.user.displayAvatarURL()
            })
            .setTimestamp()
            // Fix: Replaced process.env.BOT_VERSION with the version constant
            // from package.json to ensure the version is always found.
            .setFooter({ text: `${this.client.user.username} v${version} • mlvs.me` });
    }
    
    /**
     * Gets a placeholder image URL
     */
    getPlaceholder(type) {
        return THEME.placeholders[type] || null;
    }

    /**
     * Creates a success embed
     */
    success(title, description, fields = []) {
        const embed = this.createBaseEmbed('success')
            .setTitle(`${THEME.emojis.success} ${title}`);
        
        if (description) {
            embed.setDescription(description);
        }

        if (fields.length > 0) {
            embed.addFields(fields);
        }

        return embed;
    }

    /**
     * Creates an error embed
     */
    error(title, description, fields = []) {
        const embed = this.createBaseEmbed('error')
            .setTitle(`${THEME.emojis.error} ${title}`);
        
        if (description) {
            embed.setDescription(description);
        }

        if (fields.length > 0) {
            embed.addFields(fields);
        }

        return embed;
    }

    /**
     * Creates an info embed
     */
    info(title, description, fields = []) {
        const embed = this.createBaseEmbed('info')
            .setTitle(`${THEME.emojis.info} ${title}`);
        
        if (description) {
            embed.setDescription(description);
        }

        if (fields.length > 0) {
            embed.addFields(fields);
        }

        return embed;
    }

    /**
     * Creates a warning embed
     */
    warning(title, description, fields = []) {
        const embed = this.createBaseEmbed('warning')
            .setTitle(`⚠️ ${title}`);
        
        if (description) {
            embed.setDescription(description);
        }

        if (fields.length > 0) {
            embed.addFields(fields);
        }

        return embed;
    }

    /**
     * Creates a loading embed
     */
    loading(title, description) {
        const embed = this.createBaseEmbed('info')
            .setTitle(`${THEME.emojis.loading} ${title}`);
        
        if (description) {
            embed.setDescription(description);
        }

        return embed;
    }
}

module.exports = { CustomEmbedBuilder, THEME };
