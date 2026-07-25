import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('[Axios Request]', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('[Axios Request Error]', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('[Axios Response]', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('[Axios Response Error]', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;
