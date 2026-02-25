const BASE_URL = 'http://localhost:3001/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    console.log('API Request Header Check - Token present:', !!token);
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const api = {
    get: async (endpoint) => {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            headers: getHeaders()
        });
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('isAuthenticated');
            window.location.href = '/login'; // Force redirect on session expiry
            return;
        }
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `API request failed with status ${response.status}`);
        }
        return response.json();
    },

    post: async (endpoint, data) => {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('isAuthenticated');
            window.location.href = '/login';
            return;
        }
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `API request failed with status ${response.status}`);
        }
        return response.json();
    }
};
