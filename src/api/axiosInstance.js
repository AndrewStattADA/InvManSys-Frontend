import axios from 'axios';

const API_BASE_URL = 'https://super-duper-space-adventure-7v59rwq7qxvqfrrjr-8000.app.github.dev/api/';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;