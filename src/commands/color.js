// src/commands/color.js

const { SlashCommandBuilder } = require('discord.js');
const { CustomEmbedBuilder, THEME } = require('../utils/embedBuilder');

module.exports = {
    // Add a category property
    category: 'General',
    
    data: new SlashCommandBuilder()
        .setName('color')
        .setDescription('Work with colors - generate palettes, convert formats, or get color info')
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Get detailed information about a color')
                .addStringOption(option =>
                    option
                        .setName('color')
                        .setDescription('Color in hex (#FF0000), RGB (255,0,0), or name (red)')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('palette')
                .setDescription('Generate a color palette')
                .addStringOption(option =>
                    option
                        .setName('type')
                        .setDescription('Type of palette to generate')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Complementary', value: 'complementary' },
                            { name: 'Analogous', value: 'analogous' },
                            { name: 'Triadic', value: 'triadic' },
                            { name: 'Monochromatic', value: 'monochromatic' },
                            { name: 'Random', value: 'random' }
                        )
                )
                .addStringOption(option =>
                    option
                        .setName('base_color')
                        .setDescription('The base color to build the palette from (hex, RGB, or name)')
                        .setRequired(false)
                )
        ),

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder(interaction.client);
        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand();
        const baseColorInput = interaction.options.getString('color') || interaction.options.getString('base_color');
        let colorRGB;

        try {
            colorRGB = parseColor(baseColorInput);
        } catch (e) {
            const errorEmbed = embedBuilder.error('Invalid Color', e.message);
            return interaction.editReply({ embeds: [errorEmbed] });
        }

        if (subcommand === 'info') {
            const colorInfoEmbed = createColorInfoEmbed(embedBuilder, colorRGB);
            await interaction.editReply({ embeds: [colorInfoEmbed] });
        } else if (subcommand === 'palette') {
            const paletteType = interaction.options.getString('type');
            const paletteEmbed = createPaletteEmbed(embedBuilder, colorRGB, paletteType);
            await interaction.editReply({ embeds: [paletteEmbed] });
        }
    },
};

// --- Helper Functions ---

/**
 * Parses a color string and returns an RGB array.
 */
function parseColor(colorString) {
    if (!colorString) {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return [r, g, b];
    }
    
    // Hex format (#RRGGBB, #RGB)
    if (colorString.startsWith('#')) {
        let hex = colorString.slice(1);
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }
        if (!/^[0-9A-F]{6}$/i.test(hex)) {
            throw new Error('Invalid hex color format.');
        }
        return [
            parseInt(hex.substring(0, 2), 16),
            parseInt(hex.substring(2, 4), 16),
            parseInt(hex.substring(4, 6), 16)
        ];
    }

    // RGB format (r, g, b)
    const rgbMatch = colorString.match(/^(\d+),\s*(\d+),\s*(\d+)$/);
    if (rgbMatch) {
        const r = parseInt(rgbMatch[1], 10);
        const g = parseInt(rgbMatch[2], 10);
        const b = parseInt(rgbMatch[3], 10);
        if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
            throw new Error('RGB values must be between 0 and 255.');
        }
        return [r, g, b];
    }
    
    // Named colors (simplified for this example)
    const namedColors = {
        'red': [255, 0, 0], 'green': [0, 128, 0], 'blue': [0, 0, 255], 'white': [255, 255, 255], 'black': [0, 0, 0]
    };
    if (namedColors[colorString.toLowerCase()]) {
        return namedColors[colorString.toLowerCase()];
    }
    
    throw new Error('Unsupported color format. Please use hex, RGB, or a basic color name.');
}

/**
 * Creates the color info embed.
 */
function createColorInfoEmbed(embedBuilder, colorRGB) {
    const [r, g, b] = colorRGB;
    const hex = rgbToHex(r, g, b);
    const [h, s, l] = rgbToHsl(r, g, b);

    const imageUrl = `https://www.colorhexa.com/${hex.slice(1)}.png`;

    return embedBuilder.info(
        `Color Info for ${hex}`,
        `Details for the color you provided.`
    )
    .setColor(hex)
    .addFields([
        { name: 'Hex', value: `\`${hex.toUpperCase()}\``, inline: true },
        { name: 'RGB', value: `\`rgb(${r}, ${g}, ${b})\``, inline: true },
        { name: 'HSL', value: `\`hsl(${h.toFixed(0)}, ${s.toFixed(0)}%, ${l.toFixed(0)}%)\``, inline: true }
    ])
    .setThumbnail(imageUrl);
}

/**
 * Creates the color palette embed.
 */
function createPaletteEmbed(embedBuilder, baseColor, type) {
    const paletteColors = generatePalette(baseColor, type);
    
    const fields = paletteColors.map(([r, g, b], index) => {
        const hex = rgbToHex(r, g, b);
        const imageUrl = `https://via.placeholder.com/50/${hex.slice(1).toUpperCase()}/FFFFFF?text=${index + 1}`;
        return {
            name: `Color ${index + 1}`,
            value: `\`${hex.toUpperCase()}\`\n[Image](${imageUrl})`,
            inline: true
        };
    });

    const paletteEmbed = embedBuilder.info(
        `${type.charAt(0).toUpperCase() + type.slice(1)} Palette`,
        `Generated a **${type}** color palette.`
    )
    .setColor(rgbToHex(...baseColor))
    .addFields(fields);

    return paletteEmbed;
}

/**
 * Generates a color palette based on a base color and type.
 */
function generatePalette(baseColor, type) {
    const [r, g, b] = baseColor;
    
    // Helper function to darken a color
    const darken = (r, g, b, amount) => {
        return [
            Math.max(0, r - Math.floor(r * amount)),
            Math.max(0, g - Math.floor(g * amount)),
            Math.max(0, b - Math.floor(b * amount)),
        ];
    };

    // Helper function to lighten a color
    const lighten = (r, g, b, amount) => {
        return [
            Math.min(255, r + Math.floor((255 - r) * amount)),
            Math.min(255, g + Math.floor((255 - g) * amount)),
            Math.min(255, b + Math.floor((255 - b) * amount)),
        ];
    };
    
    switch (type) {
        case 'complementary':
            return [baseColor, rotateHue(r, g, b, 180)];
            
        case 'analogous':
            return [
                rotateHue(r, g, b, -30),
                rotateHue(r, g, b, -15),
                baseColor,
                rotateHue(r, g, b, 15),
                rotateHue(r, g, b, 30)
            ];

        case 'triadic':
            return [
                baseColor,
                rotateHue(r, g, b, 120),
                rotateHue(r, g, b, 240)
            ];

        case 'monochromatic':
            return [
                darken(r, g, b, 0.4),
                darken(r, g, b, 0.2),
                baseColor,
                lighten(r, g, b, 0.2),
                lighten(r, g, b, 0.4)
            ];
            
        case 'random':
            const colors = [baseColor];
            for (let i = 0; i < 4; i++) {
                colors.push([
                    Math.floor(Math.random() * 256),
                    Math.floor(Math.random() * 256),
                    Math.floor(Math.random() * 256)
                ]);
            }
            return colors;
            
        default:
            return [baseColor];
    }
}

/**
 * Rotates the hue of a color.
 */
function rotateHue(r, g, b, degrees) {
    const [h, s, l] = rgbToHsl(r, g, b);
    const newHue = (h + degrees + 360) % 360;
    return hslToRgb(newHue, s, l);
}

/**
 * Converts an RGB color to HSL.
 */
function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h * 360, s * 100, l * 100];
}

/**
 * Converts an HSL color back to RGB.
 */
function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Converts an RGB color to a hex string.
 */
function rgbToHex(r, g, b) {
    const toHex = (c) => {
        const hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
