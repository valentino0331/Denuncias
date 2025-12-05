const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Error en la petición');
    }
    return data;
};

const getToken = () => localStorage.getItem('token');

export const authAPI = {
    register: async (userData) => {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        return handleResponse(response);
    },

    verifyEmail: async (email, code) => {
        const response = await fetch(`${API_URL}/auth/verify-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code }),
        });
        return handleResponse(response);
    },

    login: async (email, password) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        return handleResponse(response);
    },

    verify: async (token) => {
        const response = await fetch(`${API_URL}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    },

    forgotPassword: async (email) => {
        const response = await fetch(`${API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        return handleResponse(response);
    },

    resetPassword: async (email, code, newPassword) => {
        const response = await fetch(`${API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code, newPassword }),
        });
        return handleResponse(response);
    },
};

export const reportsAPI = {
    create: async (reportData) => {
        const response = await fetch(`${API_URL}/reports`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
            body: JSON.stringify(reportData),
        });
        return handleResponse(response);
    },

    getMyReports: async () => {
        const response = await fetch(`${API_URL}/reports/my-reports`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
            },
        });
        return handleResponse(response);
    },

    getAllReports: async () => {
        const response = await fetch(`${API_URL}/reports/all`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
            },
        });
        return handleResponse(response);
    },
};