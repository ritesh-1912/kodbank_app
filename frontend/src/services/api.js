import axios from 'axios';

// Use relative URL to leverage Vite proxy (which handles CORS)
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important: Send cookies with requests
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Register a new user
 */
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

/**
 * Login user
 */
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

/**
 * Check user balance (requires authentication)
 */
export const checkBalance = async () => {
  const response = await api.get('/balance');
  return response.data;
};

export default api;
