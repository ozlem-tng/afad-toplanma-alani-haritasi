import api from './index';

// Inside src/api/auth.jsx

export const authService = {
    register: async (email, password) => {
        const response = await api.post('/User/register', { email, password });
        return response.data;
    },
    login: async (email, password) => {
        const response = await api.post('/User/login', { email, password });
        return response.data;
    },
    changePassword: async (email, newPassword) => {
        const response = await api.post('/User/change-password', { email, newPassword });
        return response.data;
    },
    // ADD THIS METHOD HERE:
    requestEntryVerification: async (email) => {
        // Wrapping the string explicitly in JSON quotes so [FromBody] can parse it cleanly
        const response = await api.post('/User/request-entry-verification', JSON.stringify(email), {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    }
};