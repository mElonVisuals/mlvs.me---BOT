/**
 * Database Utility
 * Handles connection and queries for the MySQL database.
 */

const mysql = require('mysql2/promise');
const prettyMs = require('pretty-ms');
const { CustomEmbedBuilder } = require('./embedBuilder');

let pool;

async function connectToDatabase() {
    if (!process.env.DATABASE_URL) {
        throw new Error('❌ DATABASE_URL is not set in the .env file.');
    }

    // Create a connection pool from the provided URL
    pool = mysql.createPool(process.env.DATABASE_URL);
    
    // Test the connection
    await pool.getConnection();
}

async function createRemindersTable() {
    if (!pool) {
        throw new Error('Database pool not initialized.');
    }
    const query = `
        CREATE TABLE IF NOT EXISTS reminders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            userId VARCHAR(255) NOT NULL,
            channelId VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            timestamp BIGINT NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    await pool.query(query);
    console.log('✅ Reminders table checked/created.');
}

async function saveReminder(userId, channelId, message, timestamp) {
    if (!pool) {
        throw new Error('Database pool not initialized.');
    }
    const query = 'INSERT INTO reminders (userId, channelId, message, timestamp) VALUES (?, ?, ?, ?)';
    await pool.execute(query, [userId, channelId, message, timestamp]);
}

async function getReminders() {
    if (!pool) {
        throw new Error('Database pool not initialized.');
    }
    const query = 'SELECT * FROM reminders WHERE timestamp > ?';
    const [rows] = await pool.execute(query, [Date.now()]);
    return rows;
}

async function deleteReminder(id) {
    if (!pool) {
        throw new Error('Database pool not initialized.');
    }
    const query = 'DELETE FROM reminders WHERE id = ?';
    await pool.execute(query, [id]);
}

// Function to handle sending the reminder and cleaning up the database
async function sendReminderAndCleanup(client, reminder) {
    try {
        const user = await client.users.fetch(reminder.userId);
        const channel = await client.channels.fetch(reminder.channelId);

        if (user && channel) {
            const embedBuilder = new CustomEmbedBuilder(client);
            const reminderEmbed = embedBuilder.info(
                'Reminder!',
                `Hey ${user}! You asked me to remind you about:`
            ).addFields(
                { name: 'Your Message', value: `\`\`\`${reminder.message}\`\`\`` }
            );

            await channel.send({ content: `<@${user.id}>`, embeds: [reminderEmbed] });
        }
    } catch (error) {
        console.error(`Error sending reminder to ${reminder.userId} in ${reminder.channelId}:`, error);
    } finally {
        // Always delete the reminder from the database, even if sending failed
        await deleteReminder(reminder.id);
    }
}

// Function to schedule a reminder using setTimeout
function checkReminderStatus(client, reminder) {
    const timeRemaining = reminder.timestamp - Date.now();

    if (timeRemaining > 0) {
        setTimeout(() => sendReminderAndCleanup(client, reminder), timeRemaining);
    } else {
        // If the reminder is already due, send it immediately
        sendReminderAndCleanup(client, reminder);
    }
}

module.exports = {
    connectToDatabase,
    createRemindersTable,
    saveReminder,
    getReminders,
    deleteReminder,
    checkReminderStatus,
};
