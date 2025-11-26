/**
 * Logger Utility Module
 * Provides conditional logging based on debug mode
 */

// Check if debug mode is enabled via URL parameter or localStorage
const DEBUG_MODE =
    new URLSearchParams(window.location.search).has('debug') ||
    localStorage.getItem('lectureDebugMode') === 'true';

/**
 * Conditional console.log
 * @param {...any} args - Arguments to log
 */
export function log(...args) {
    if (DEBUG_MODE) {
        console.log(...args);
    }
}

/**
 * Conditional console.warn (always shown as it indicates potential issues)
 * @param {...any} args - Arguments to warn
 */
export function warn(...args) {
    console.warn(...args);
}

/**
 * Conditional console.error (always shown as it indicates errors)
 * @param {...any} args - Arguments to error
 */
export function error(...args) {
    console.error(...args);
}

/**
 * Enable debug mode
 */
export function enableDebug() {
    localStorage.setItem('lectureDebugMode', 'true');
    console.log('Debug mode enabled. Reload page to see debug logs.');
}

/**
 * Disable debug mode
 */
export function disableDebug() {
    localStorage.removeItem('lectureDebugMode');
    console.log('Debug mode disabled. Reload page.');
}

/**
 * Check if debug mode is enabled
 * @returns {boolean}
 */
export function isDebugMode() {
    return DEBUG_MODE;
}

// Expose to window for easy console access
window.lectureDebug = {
    enable: enableDebug,
    disable: disableDebug,
    isEnabled: isDebugMode
};

if (DEBUG_MODE) {
    console.log('%c[Lecture Template] Debug mode enabled', 'color: #4CAF50; font-weight: bold');
    console.log('To disable: lectureDebug.disable() or remove ?debug from URL');
}
