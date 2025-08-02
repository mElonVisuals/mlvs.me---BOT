/**
 * Color Command
 * Generate color palettes, convert formats, and display color information
 */

const { SlashCommandBuilder } = require('discord.js');
const { CustomEmbedBuilder, THEME } = require('../utils/embedBuilder');

module.exports = {
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
                            { name: 'Tetradic', value: 'tetradic' },
                            { name: 'Monochromatic', value: 'monochromatic' },
                            { name: 'Random', value: 'random' }
                        )
                )
                .addStringOption(option =>
                    option
                        .setName('base')
                        .setDescription('Base color (optional, random if not provided)')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('random')
                .setDescription('Generate random colors')
                .addIntegerOption(option =>
                    option
                        .setName('count')
                        .setDescription('Number of colors to generate (1-10)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(10)
                )
        ),

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder(interaction.client);
        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case 'info':
                    await handleColorInfo(interaction, embedBuilder);
                    break;
                case 'palette':
                    await handlePalette(interaction, embedBuilder);
                    break;
                case 'random':
                    await handleRandom(interaction, embedBuilder);
                    break;
            }
        } catch (error) {
            console.error('❌ Error in color command:', error);
            const errorEmbed = embedBuilder.error(
                'Color Processing Error',
                'An error occurred while processing your color request. Please check your input and try again.'
            );
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};

// Handle color info subcommand
async function handleColorInfo(interaction, embedBuilder) {
    const colorInput = interaction.options.getString('color');
    const color = parseColor(colorInput);

    if (!color) {
        const errorEmbed = embedBuilder.error(
            'Invalid Color',
            'Please provide a valid color in one of these formats:',
            [
                {
                    name: '🎨 Supported Formats',
                    value: [
                        '**Hex:** `#FF0000`, `#f00`, `FF0000`',
                        '**RGB:** `rgb(255,0,0)`, `255,0,0`',
                        '**Color Names:** `red`, `blue`, `lime`, etc.'
                    ].join('\n'),
                    inline: false
                }
            ]
        );
        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const [r, g, b] = color;
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    const hsv = rgbToHsv(r, g, b);
    
    // Generate color variations
    const complementary = getComplementary(r, g, b);
    const lighter = lighten(r, g, b, 0.2);
    const darker = darken(r, g, b, 0.2);

    const colorEmbed = embedBuilder.createBaseEmbed('primary')
        .setTitle(`🎨 Color Information`)
        .setDescription(`Detailed information about your color`)
        .setColor(parseInt(hex.slice(1), 16))
        .addFields([
            {
                name: '🔢 Color Values',
                value: [
                    `**Hex:** \`${hex}\``,
                    `**RGB:** \`rgb(${r}, ${g}, ${b})\``,
                    `**HSL:** \`hsl(${hsl[0]}°, ${hsl[1]}%, ${hsl[2]}%)\``,
                    `**HSV:** \`hsv(${hsv[0]}°, ${hsv[1]}%, ${hsv[2]}%)\``
                ].join('\n'),
                inline: true
            },
            {
                name: '🎯 Color Properties',
                value: [
                    `**Luminance:** ${getLuminance(r, g, b).toFixed(3)}`,
                    `**Brightness:** ${getBrightness(r, g, b).toFixed(1)}%`,
                    `**Contrast Ratio:** ${getContrastRatio(r, g, b)}:1`,
                    `**Temperature:** ${getColorTemperature(r, g, b)}`
                ].join('\n'),
                inline: true
            },
            {
                name: '🎨 Color Variations',
                value: [
                    `**Complementary:** \`${rgbToHex(...complementary)}\``,
                    `**20% Lighter:** \`${rgbToHex(...lighter)}\``,
                    `**20% Darker:** \`${rgbToHex(...darker)}\``,
                    `**Web Safe:** \`${getWebSafeColor(r, g, b)}\``
                ].join('\n'),
                inline: false
            }
        ])
        .setImage(`https://via.placeholder.com/400x100/${hex.slice(1)}/${getContrastingColor(r, g, b)}?text=${encodeURIComponent(hex)}`);

    await interaction.reply({ embeds: [colorEmbed] });
}

// Handle palette generation
async function handlePalette(interaction, embedBuilder) {
    const paletteType = interaction.options.getString('type');
    const baseColorInput = interaction.options.getString('base');
    
    let baseColor;
    if (baseColorInput) {
        baseColor = parseColor(baseColorInput);
        if (!baseColor) {
            const errorEmbed = embedBuilder.error(
                'Invalid Base Color',
                'Please provide a valid base color or leave it empty for a random base.'
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    } else {
        // Generate random base color
        baseColor = [
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256)
        ];
    }

    const palette = generatePalette(paletteType, baseColor);
    const paletteEmbed = embedBuilder.createBaseEmbed('primary')
        .setTitle(`🎨 ${paletteType.charAt(0).toUpperCase() + paletteType.slice(1)} Color Palette`)
        .setDescription(`Generated ${palette.length} colors based on your base color`)
        .setColor(parseInt(rgbToHex(...baseColor).slice(1), 16));

    // Add color fields
    palette.forEach((color, index) => {
        const hex = rgbToHex(...color);
        const [r, g, b] = color;
        paletteEmbed.addFields({
            name: `Color ${index + 1}${index === 0 ? ' (Base)' : ''}`,
            value: [
                `**Hex:** \`${hex}\``,
                `**RGB:** \`${r}, ${g}, ${b}\``
            ].join('\n'),
            inline: true
        });
    });

    // Create palette visualization URL
    const paletteColors = palette.map(color => rgbToHex(...color).slice(1)).join('-');
    const imageUrl = `https://via.placeholder.com/600x150/${paletteColors.split('-')[0]}/FFFFFF?text=Color+Palette`;
    
    paletteEmbed.setImage(imageUrl);

    await interaction.reply({ embeds: [paletteEmbed] });
}

// Handle random colors
async function handleRandom(interaction, embedBuilder) {
    const count = interaction.options.getInteger('count') || 5;
    const colors = [];

    for (let i = 0; i < count; i++) {
        colors.push([
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256)
        ]);
    }

    const randomEmbed = embedBuilder.createBaseEmbed('primary')
        .setTitle(`🎲 Random Colors`)
        .setDescription(`Generated ${count} random color${count === 1 ? '' : 's'} for you`)
        .setColor(parseInt(rgbToHex(...colors[0]).slice(1), 16));

    colors.forEach((color, index) => {
        const hex = rgbToHex(...color);
        const [r, g, b] = color;
        randomEmbed.addFields({
            name: `Random Color ${index + 1}`,
            value: [
                `**Hex:** \`${hex}\``,
                `**RGB:** \`${r}, ${g}, ${b}\``,
                `**HSL:** \`${rgbToHsl(r, g, b).join(', ')}\``
            ].join('\n'),
            inline: true
        });
    });

    await interaction.reply({ embeds: [randomEmbed] });
}

// Color parsing and utility functions
function parseColor(input) {
    const str = input.trim().toLowerCase();
    
    // Named colors
    const namedColors = {
        'red': [255, 0, 0], 'green': [0, 128, 0], 'blue': [0, 0, 255],
        'white': [255, 255, 255], 'black': [0, 0, 0], 'yellow': [255, 255, 0],
        'cyan': [0, 255, 255], 'magenta': [255, 0, 255], 'lime': [0, 255, 0],
        'orange': [255, 165, 0], 'purple': [128, 0, 128], 'pink': [255, 192, 203]
    };
    
    if (namedColors[str]) return namedColors[str];
    
    // Hex colors
    const hexMatch = str.match(/^#?([a-f0-9]{6}|[a-f0-9]{3})$/);
    if (hexMatch) {
        let hex = hexMatch[1];
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }
        return [
            parseInt(hex.slice(0, 2), 16),
            parseInt(hex.slice(2, 4), 16),
            parseInt(hex.slice(4, 6), 16)
        ];
    }
    
    // RGB colors
    const rgbMatch = str.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)|(\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
        const r = parseInt(rgbMatch[1] || rgbMatch[4]);
        const g = parseInt(rgbMatch[2] || rgbMatch[5]);
        const b = parseInt(rgbMatch[3] || rgbMatch[6]);
        if (r <= 255 && g <= 255 && b <= 255) return [r, g, b];
    }
    
    return null;
}

// Color conversion functions
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
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

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max;

    const d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
        h = 0;
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
}

// Color utility functions
function getComplementary(r, g, b) {
    return [255 - r, 255 - g, 255 - b];
}

function lighten(r, g, b, amount) {
    return [
        Math.min(255, Math.round(r + (255 - r) * amount)),
        Math.min(255, Math.round(g + (255 - g) * amount)),
        Math.min(255, Math.round(b + (255 - b) * amount))
    ];
}

function darken(r, g, b, amount) {
    return [
        Math.max(0, Math.round(r * (1 - amount))),
        Math.max(0, Math.round(g * (1 - amount))),
        Math.max(0, Math.round(b * (1 - amount)))
    ];
}

function getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getBrightness(r, g, b) {
    return ((r * 299) + (g * 587) + (b * 114)) / 1000 / 255 * 100;
}

function getContrastRatio(r, g, b) {
    const luminance = getLuminance(r, g, b);
    const whiteLuminance = 1;
    const blackLuminance = 0;
    
    const whiteContrast = (whiteLuminance + 0.05) / (luminance + 0.05);
    const blackContrast = (luminance + 0.05) / (blackLuminance + 0.05);
    
    return Math.max(whiteContrast, blackContrast).toFixed(1);
}

function getContrastingColor(r, g, b) {
    const brightness = getBrightness(r, g, b);
    return brightness > 50 ? '000000' : 'FFFFFF';
}

function getColorTemperature(r, g, b) {
    const brightness = getBrightness(r, g, b);
    if (r > g && r > b) return 'Warm';
    if (b > r && b > g) return 'Cool';
    return 'Neutral';
}

function getWebSafeColor(r, g, b) {
    const webSafeValues = [0, 51, 102, 153, 204, 255];
    const findClosest = (value) => {
        return webSafeValues.reduce((prev, curr) => 
            Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
        );
    };
    
    return rgbToHex(findClosest(r), findClosest(g), findClosest(b));
}

// Palette generation functions
function generatePalette(type, baseColor) {
    const [r, g, b] = baseColor;
    
    switch (type) {
        case 'complementary':
            return [
                baseColor,
                getComplementary(r, g, b)
            ];
            
        case 'analogous':
            return [
                baseColor,
                rotateHue(r, g, b, 30),
                rotateHue(r, g, b, -30)
            ];
            
        case 'triadic':
            return [
                baseColor,
                rotateHue(r, g, b, 120),
                rotateHue(r, g, b, 240)
            ];
            
        case 'tetradic':
            return [
                baseColor,
                rotateHue(r, g, b, 90),
                getComplementary(r, g, b),
                rotateHue(r, g, b, 270)
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

function rotateHue(r, g, b, degrees) {
    const [h, s, l] = rgbToHsl(r, g, b);
    const newHue = (h + degrees + 360) % 360;
    return hslToRgb(newHue, s, l);
}

function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    
    const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    const r = hue2rgb(p, q, h + 1/3);
    const g = hue2rgb(p, q, h);
    const b = hue2rgb(p, q, h - 1/3);
    
    return [
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255)
    ];
}