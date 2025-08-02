/**
 * Embed Builder Utility
 * Creates consistent, themed embeds for the bot
 */

const { EmbedBuilder } = require('discord.js');

// Bot theme configuration
const THEME = {
    colors: {
        primary: 0x7C3AED,    // Purple
        success: 0x10B981,    // Green
        error: 0xEF4444,      // Red
        warning: 0xF59E0B,    // Yellow
        info: 0x3B82F6       // Blue
    },
    emojis: {
        // Replace these with your actual custom emoji IDs
        success: '<:tick:1400984418004504596>',
        error: '<:error:1400984416133840957>',
        loading: '<a:loading:1400984419350876161>',
        info: '<:info1:1400984414325837975> ',
        star: '<a:star_spin:1400984411935346698>',
        ping: '<a:alert:1400984409607507978> '
    }
};

class CustomEmbedBuilder {
    constructor(client) {
        this.client = client;
    }

    /**
     * Creates a base embed with consistent styling
     */
    createBaseEmbed(type = 'primary') {
        const embed = new EmbedBuilder()
            .setColor(THEME.colors[type] || THEME.colors.primary)
            .setTimestamp()
            .setFooter({
                text: `${process.env.BOT_NAME || 'mlvs.me'} • v${process.env.BOT_VERSION || '1.0.0'}`,
                iconURL: this.client?.user?.displayAvatarURL() || undefined
            });

        return embed;
    }

    /**
     * Creates a success embed
     */
    success(title, description, fields = []) {
        const embed = this.createBaseEmbed('success')
            .setTitle(`${THEME.emojis.success} ${title}`)
            .setDescription(description);

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
            .setTitle(`${THEME.emojis.error} ${title}`)
            .setDescription(description);

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
            .setTitle(`${THEME.emojis.info} ${title}`)
            .setDescription(description);

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
            .setTitle(`⚠️ ${title}`)
            .setDescription(description);

        if (fields.length > 0) {
            embed.addFields(fields);
        }

        return embed;
    }

    /**
     * Creates a loading embed
     */
    loading(title, description) {
        return this.createBaseEmbed('primary')
            .setTitle(`${THEME.emojis.loading} ${title}`)
            .setDescription(description);
    }
}

module.exports = { CustomEmbedBuilder, THEME };