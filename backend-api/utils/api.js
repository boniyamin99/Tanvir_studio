// File: backend-api/utils/api.js

const BASE_URL = 'https://suntecpropertiesltd.com/api'; // Updated BASE_URL for cPanel domain

/**
 * Core request function that handles all API calls, supporting JSON and FormData (for file uploads).
 * @param {string} endpoint - The API endpoint (e.g., '/bookings', '/users/login').
 * @param {string} method - The HTTP method (e.g., 'GET', 'POST', 'PUT', 'DELETE').
 * @param {object|FormData|null} body - The request body (JSON object or FormData for files).
 * @returns {Promise<any>} The parsed JSON response or true if no content.
 */
const request = async (endpoint, method = 'GET', body = null) => {
    const headers = new Headers();

    // Set Content-Type only if the body is not FormData (for file uploads)
    if (!(body instanceof FormData)) {
        headers.append('Content-Type', 'application/json');
    }

    const token = localStorage.getItem('authToken'); 
    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }

    const config = {
        method,
        headers,
    };

    if (body) {
        config.body = (body instanceof FormData) ? body : JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Server error or invalid JSON response.' }));
            throw new Error(errorData.message || 'Something went wrong');
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        return true; 

    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
};

const api = {
    get: (endpoint) => request(endpoint),
    post: (endpoint, body) => request(endpoint, 'POST', body),
    put: (endpoint, body) => request(endpoint, 'PUT', body),
    del: (endpoint) => request(endpoint, 'DELETE'),
};

// Make it available to other scripts (e.g., by attaching to window in a browser environment)
// For use in modules, you would use 'export default api;' or 'export { api };'

// This line might be removed if you are using ES modules and importing 'api' directly.
// For browser global scope, you might want: window.api = api;
