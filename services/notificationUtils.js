/**
 * Notification Utilities
 * 
 * Shared logic for retry mechanisms and backoff delays across
 * different communication services (SMS, Email, WhatsApp).
 */

const DEFAULT_RETRIES = Number(process.env.MESSAGE_MAX_RETRIES) || 3;
const RETRY_BASE_MS = Number(process.env.MESSAGE_RETRY_BASE_MS) || 500;

/**
 * Calculates exponential backoff delay.
 * @param {number} attempt 
 * @returns {Promise<void>}
 */
async function backoffDelay(attempt) {
    const ms = RETRY_BASE_MS * Math.pow(2, attempt - 1);
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Attempts an async request with exponential backoff.
 * @param {Function} fn - The function to attempt.
 * @param {number} maxAttempts 
 * @returns {Promise<{success: boolean, res?: any, error?: any}>}
 */
async function attemptRequest(fn, maxAttempts = DEFAULT_RETRIES) {
    let attempt = 0;
    while (attempt < maxAttempts) {
        attempt += 1;
        try {
            const res = await fn();
            return { success: true, res };
        } catch (err) {
            // Extract status for standard HTTP errors or custom error objects
            const status = (err && err.response && err.response.status) || (err && err.status);
            
            // Do not retry on 4xx client errors (bad request, unauthorized, etc.)
            if (status && status >= 400 && status < 500) {
                return { success: false, error: err };
            }
            
            if (attempt >= maxAttempts) {
                return { success: false, error: err };
            }
            
            await backoffDelay(attempt);
        }
    }
    return { success: false, error: new Error('Max attempts reached') };
}

/**
 * Standardizes the response from a notification provider.
 * @param {Promise<any>} promise 
 * @param {string} serviceName 
 * @param {Function} getProviderId 
 * @returns {Promise<{success: boolean, providerId?: string, error?: string}>}
 */
async function wrapServiceCall(promise, serviceName, getProviderId = (res) => res?.data?.id || res?.sid) {
    try {
        const result = await promise;
        if (!result.success) throw result.error;
        return { 
            success: true, 
            providerId: getProviderId(result.res) 
        };
    } catch (err) {
        console.error(`${serviceName} error:`, err.message || err);
        return { success: false, error: err.message || String(err) };
    }
}

module.exports = {
    attemptRequest,
    backoffDelay,
    wrapServiceCall,
};
