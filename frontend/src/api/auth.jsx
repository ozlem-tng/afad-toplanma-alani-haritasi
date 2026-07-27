import api from './index';


export const authService = {
    register: async (name, email, password, registrationNumber) => {
        const response = await api.post('/User/register', { name, email, password, registrationNumber });
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
    verifyLogin: async (email, code) => {
        const response = await api.post('/User/verify-login', {
            email: email,
            code: code
        });
        return response.data;
    }
};