/**
 * @file utils.js
 * @description This file contains various utility functions used throughout the bot.
 * It is structured to be easily importable by other files.
 */

/**
 * Converts bot uptime from milliseconds to a human-readable string.
 * @param {number} uptime The bot's uptime in milliseconds (client.uptime).
 * @returns {string} The formatted uptime string, e.g., "1 day, 2 hours, 30 minutes".
 */
function getBotUptime(uptime) {
    if (uptime === null || uptime === undefined) {
        return 'N/A';
    }
    let totalSeconds = (uptime / 1000);
    const days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);

    const parts = [];
    if (days > 0) {
        parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    }
    if (hours > 0) {
        parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    }
    if (minutes > 0) {
        parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
    }

    if (parts.length === 0) {
        return 'Less than a minute';
    }

    return parts.join(', ');
}

// You can add more utility functions here as needed. For example:
/**
 * Formats a given date object into a readable string.
 * @param {Date} date The date object to format.
 * @returns {string} The formatted date string.
 */
function formatDate(date) {
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    });
}

// Export the utility functions to be used by other modules.
module.exports = {
    getBotUptime,
    formatDate,
};
