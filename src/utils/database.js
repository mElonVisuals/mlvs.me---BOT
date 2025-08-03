/**
 * Database Utility
 * Handles all MySQL connections and queries for the bot
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

let pool;

async function initDatabase() {
    try {
        // Create a connection pool to handle multiple connections
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            name: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Test the connection
        await pool.getConnection();
        console.log('✅ Successfully connected to MySQL database.');

        // Create the reminders table if it doesn't exist
        const createTableSql = `
        CREATE TABLE IF NOT EXISTS reminders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            userId VARCHAR(255) NOT NULL,
            channelId VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            remindAt BIGINT NOT NULL
        )
        `;
        await pool.execute(createTableSql);
        console.log('✅ "reminders" table is ready.');
    } catch (error) {
        console.error('❌ Failed to connect to MySQL or create table:', error);
        process.exit(1); // Exit the process if the database connection fails
    }
}

async function saveReminder(userId, channelId, message, remindAt) {
    const sql = 'INSERT INTO reminders (userId, channelId, message, remindAt) VALUES (?, ?, ?, ?)';
    await pool.execute(sql, [userId, channelId, message, remindAt]);
}

async function getPendingReminders() {
    const now = Date.now();
    const sql = 'SELECT * FROM reminders WHERE remindAt > ? ORDER BY remindAt ASC';
    const [rows] = await pool.execute(sql, [now]);
    return rows;
}

async function getRemindersForUser(userId) {
    const sql = 'SELECT * FROM reminders WHERE userId = ? ORDER BY remindAt ASC';
    const [rows] = await pool.execute(sql, [userId]);
    return rows;
}

async function deleteReminder(id) {
    const sql = 'DELETE FROM reminders WHERE id = ?';
    await pool.execute(sql, [id]);
}

module.exports = {
    initDatabase,
    saveReminder,
    getPendingReminders,
    getRemindersForUser,
    deleteReminder
};
