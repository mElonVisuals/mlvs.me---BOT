/**
 * Database Utility
 * Manages the connection to a MySQL database and handles table creation.
 */

const mysql = require('mysql2/promise');

let pool;

async function initializeDatabase() {
    try {
        // Create a connection pool using environment variables
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        console.log('✅ MySQL connection pool created successfully.');

        // Verify the connection and create tables
        const connection = await pool.getConnection();
        console.log('✅ Connected to MySQL database.');

        // Create 'reminders' table if it doesn't exist
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS reminders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                channel_id VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                timestamp BIGINT NOT NULL
            );
        `);
        console.log('✅ Reminders table checked/created.');

        // Create 'afk_users' table if it doesn't exist
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS afk_users (
                user_id VARCHAR(255) PRIMARY KEY,
                message VARCHAR(255) NOT NULL,
                timestamp BIGINT NOT NULL
            );
        `);
        console.log('✅ AFK Users table checked/created.');

        connection.release();
    } catch (error) {
        console.error('❌ Failed to connect to database or create tables:', error);
        process.exit(1);
    }
}

/**
 * Executes a MySQL query using the connection pool.
 * @param {string} sql The SQL query string.
 * @param {Array} params The parameters for the query.
 * @returns {Promise<Array>} The query results.
 */
async function query(sql, params) {
    if (!pool) {
        throw new Error('Database pool not initialized. Call initializeDatabase() first.');
    }
    const [rows] = await pool.execute(sql, params);
    return rows;
}

module.exports = {
    initializeDatabase,
    query
};
