// File: Backend-api/utils/api.js
// NOTE: This file is typically used as a frontend utility to interact with the backend API.
// If it resides in your backend-api folder, ensure its purpose is clear within the backend context.

const BASE_URL = 'http://localhost:5000/api'; // Your backend API base URL

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
    // Browsers automatically set 'Content-Type: multipart/form-data' with boundaries when FormData is used.
    if (!(body instanceof FormData)) {
        headers.append('Content-Type', 'application/json');
    }

    const token = localStorage.getItem('authToken'); // Assumes authToken is stored in frontend's localStorage
    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }

    const config = {
        method,
        headers,
    };

    if (body) {
        // If it's FormData, pass it directly; otherwise, stringify for JSON
        config.body = (body instanceof FormData) ? body : JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Server error or invalid JSON response.' }));
            throw new Error(errorData.message || 'Something went wrong');
        }

        // If response has content, parse it as JSON, otherwise return true for success
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        return true; // Return true for successful requests with no content (e.g., DELETE)

    } catch (error) {
        console.error('API request failed:', error);
        throw error; // Re-throw the error to be caught by the calling function
    }
};

// Export simple-to-use helper methods
const api = {
    get: (endpoint) => request(endpoint),
    post: (endpoint, body) => request(endpoint, 'POST', body),
    put: (endpoint, body) => request(endpoint, 'PUT', body),
    del: (endpoint) => request(endpoint, 'DELETE'),
};

// Make it available to other scripts (e.g., by attaching to window in a browser environment)
// For use in modules, you would use 'export default api;' or 'export { api };'

// Example of how to use this 'api' object in your frontend JavaScript:
// import { api } from './api.js'; // Assuming it's in a module structure
// Or if directly in HTML: <script src="path/to/api.js"></script> and then use 'api.get(...)'

// This line might be removed if you are using ES modules and importing 'api' directly.
// For browser global scope, you might want: window.api = api;
