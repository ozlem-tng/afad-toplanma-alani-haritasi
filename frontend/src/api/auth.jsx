import api from './index';
x

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
        const response = await api.post('/User/update-password', { 
            email: email, 
            NewPassword: newPassword 
        });
        return response.data;
    },
    requestEntryVerification: async (email) => {
        const response = await api.post('/User/request-entry-verification', JSON.stringify(email), {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    }
};