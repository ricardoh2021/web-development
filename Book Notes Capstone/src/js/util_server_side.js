// utils.js

/**
 * Truncates text to a specified length and adds ellipsis if truncated
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @param {boolean} [keepWords=true] - Whether to preserve whole words
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength, keepWords = true) {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= maxLength) return text;

    if (keepWords) {
        // Truncate at the last space before maxLength
        let truncated = text.substring(0, maxLength);
        truncated = truncated.substring(0, Math.min(truncated.length, truncated.lastIndexOf(' ')));
        return truncated + '...';
    }

    // Simple truncation
    return text.substring(0, maxLength) + '...';
}