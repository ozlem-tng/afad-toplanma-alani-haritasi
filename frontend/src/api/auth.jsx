
import api from './index';

export const authService = {
    register: async (email, password) => {
        const response = await api.post('/User/register', { email, password });
        return response.data;
    },
    login: async (email, password) => {
        const response = await api.post('/User/login', { email, password });
        return response.data;
    }
};