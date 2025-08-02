# mlvs.me Discord Bot

A beautifully crafted Discord bot built with Discord.js v14, featuring a scalable architecture and elegant theming.

## 🚀 Features

- **Scalable Architecture**: Modular command and event system
- **Beautiful Embeds**: Consistent, themed embeds with custom emojis
- **Error Handling**: Comprehensive error handling and logging
- **Hot Reload**: Easy development with automatic command deployment
- **Production Ready**: Optimized for deployment and scaling

## 📁 Project Structure

```
mlvs.me/
├── index.js                 # Main entry point
├── package.json            # Dependencies and scripts
├── .env                    # Environment variables
├── README.md              # This file
└── src/
    ├── commands/          # Slash commands
    │   ├── ping.js
    │   └── help.js
    ├── events/            # Event handlers
    │   ├── ready.js
    │   └── interactionCreate.js
    └── utils/             # Utility functions
        ├── commandLoader.js
        ├── eventLoader.js
        ├── embedBuilder.js
        └── deploy-commands.js
```

## 🛠️ Setup

### Prerequisites
- Node.js 18.0.0 or higher
- A Discord bot application ([Create one here](https://discord.com/developers/applications))

### Installation

1. **Clone or download this project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy the `.env` file and fill in your bot credentials:
   ```env
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_bot_client_id_here
   GUILD_ID=your_guild_id_here_for_testing
   ```

4. **Customize emojis** (Optional)
   
   Edit `src/utils/embedBuilder.js` and replace the emoji placeholders with your custom emoji IDs:
   ```javascript
   emojis: {
       success: '<:success:YOUR_EMOJI_ID_HERE>',
       error: '<:error:YOUR_EMOJI_ID_HERE>',
       // ... etc
   }
   ```

5. **Start the bot**
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

## 🎨 Customization

### Theme Colors

Edit the color palette in `src/utils/embedBuilder.js`:

```javascript
colors: {
    primary: 0x7C3AED,    // Purple
    success: 0x10B981,    // Green
    error: 0xEF4444,      // Red
    warning: 0xF59E0B,    // Yellow
    info: 0x3B82F6       // Blue
}
```

### Adding Commands

1. Create a new file in `src/commands/` (e.g., `mycommand.js`)
2. Use this template:

```javascript
const { SlashCommandBuilder } = require('discord.js');
const { CustomEmbedBuilder } = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mycommand')
        .setDescription('Description of my command'),

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder(interaction.client);
        
        const embed = embedBuilder.success(
            'Command Title',
            'Command description here'
        );

        await interaction.reply({ embeds: [embed] });
    },
};
```

3. Restart the bot - commands are automatically loaded!

### Adding Events

1. Create a new file in `src/events/` (e.g., `myevent.js`)
2. Use this template:

```javascript
const { Events } = require('discord.js');

module.exports = {
    name: Events.EventName,
    once: false, // Set to true for one-time events
    execute(arg1, arg2) {
        // Event logic here
    },
};
```

## 📜 Scripts

- `npm start` - Start the bot
- `npm run dev` - Start with nodemon for development
- `npm run deploy` - Manually deploy commands to Discord

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_TOKEN` | Your bot's token | ✅ |
| `CLIENT_ID` | Your bot's client ID | ✅ |
| `GUILD_ID` | Guild ID for testing (dev only) | ❌ |
| `BOT_NAME` | Display name for the bot | ❌ |
| `BOT_VERSION` | Version string | ❌ |
| `NODE_ENV` | Environment (development/production) | ❌ |

### Bot Permissions

Make sure your bot has these permissions:
- Send Messages
- Use Slash Commands
- Embed Links
- Read Message History

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you need help setting up or customizing this bot:

1. Check the [Discord.js Guide](https://discordjs.guide/)
2. Join the [Discord.js Discord Server](https://discord.gg/djs)
3. Create an issue in this repository

---

**Made with ❤️ for the Discord community**