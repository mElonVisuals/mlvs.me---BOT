/**
 * Database Utility for MySQL
 * Handles connection and queries for guild settings.
 */
const mysql = require('mysql2/promise');

// Validate required environment variables for the database
const requiredDbVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_DATABASE'];
for (const envVar of requiredDbVars) {
    if (!process.env[envVar]) {
        console.error(`❌ Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}
console.log('✅ Database environment variables loaded successfully');

let connection;

/**
 * Initializes and tests the database connection.
 */
async function initializeDatabase() {
    try {
        console.log('🔗 Connecting to MySQL database...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        });
        console.log('✅ Successfully connected to the MySQL database!');
    } catch (error) {
        console.error('❌ Failed to connect to MySQL database:', error);
        process.exit(1);
    }
}

/**
 * Retrieves a single setting for a guild from the database.
 * @param {string} guildId - The ID of the guild.
 * @param {string} settingKey - The key of the setting to retrieve (e.g., 'welcomeChannelId').
 * @returns {Promise<string|null>} The value of the setting, or null if not found.
 */
async function getGuildSetting(guildId, settingKey) {
    try {
        if (!connection) {
            await initializeDatabase();
        }

        const [rows] = await connection.execute(
            'SELECT settingValue FROM guildSettings WHERE guildId = ? AND settingKey = ?',
            [guildId, settingKey]
        );
        return rows.length > 0 ? rows[0].settingValue : null;
    } catch (error) {
        console.error(`❌ Error retrieving setting '${settingKey}' for guild ${guildId}:`, error);
        return null;
    }
}

/**
 * Sets or updates a single setting for a guild in the database.
 * @param {string} guildId - The ID of the guild.
 * @param {string} settingKey - The key of the setting to set.
 * @param {string|null} settingValue - The value of the setting.
 */
async function setGuildSetting(guildId, settingKey, settingValue) {
    try {
        if (!connection) {
            await initializeDatabase();
        }

        await connection.execute(
            'INSERT INTO guildSettings (guildId, settingKey, settingValue) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE settingValue = ?',
            [guildId, settingKey, settingValue, settingValue]
        );
        console.log(`💾 Saved setting '${settingKey}' for guild ${guildId}.`);
    } catch (error) {
        console.error(`❌ Error saving setting '${settingKey}' for guild ${guildId}:`, error);
        throw error;
    }
}

module.exports = {
    initializeDatabase,
    getGuildSetting,
    setGuildSetting
};
