import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // For HttpOnly cookies
});

// Request interceptor to add Access Token
api.interceptors.request.use(
    (config) => {
        // Ideally, we store this in memory or a secure auth store
        // For MVP, we'll try to read from localStorage if you choose to store it there,
        // OR just rely on the fact that if we had it in memory we'd attach it.
        // Let's assume we store the accessToken in localStorage for simplicity in this iteration,
        // although not recommended for high security.
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear invalid token
            if (typeof window !== 'undefined') {
                localStorage.removeItem('accessToken');
                // Redirect to login if not already there
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
