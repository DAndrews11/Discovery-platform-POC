import axios from 'axios';

// Determine the API base URL based on the environment
const getBaseUrl = () => {
    // Check if we're running in Replit
    if (window.location.hostname.includes('.replit.dev') || window.location.hostname.includes('.repl.co')) {
        // In Replit, both frontend and backend are served from the same domain
        return `https://${window.location.hostname}`;
    }
    // Default to localhost for local development
    return 'http://localhost:3000';
};

// Create axios instance with custom config
const instance = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true
});

// Add request interceptor for error handling
instance.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Ensure all requests have /api prefix
        if (!config.url?.startsWith('/api/')) {
            config.url = `/api${config.url}`;
        }

        // Log request for debugging
        console.log('Making request to:', config.url, 'with params:', config.params);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: error.config?.url
        });
        return Promise.reject(error);
    }
);

export default instance; 