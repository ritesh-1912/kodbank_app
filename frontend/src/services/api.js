import axios from 'axios';

// Use environment variable for API URL, fallback to relative URL for Vite proxy in dev
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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

/**
 * Get user's cards (requires authentication)
 */
export const getCards = async () => {
  const response = await api.get('/cards');
  return response.data;
};

/**
 * Get user's transactions (requires authentication)
 * Optional params: limit, type ('credit'|'debit'), search
 */
export const getTransactions = async (params = {}) => {
  const response = await api.get('/transactions', { params });
  return response.data;
};

/**
 * Transfer money to another user (toUsername or toUid, amount, note?)
 */
export const transfer = async (body) => {
  const response = await api.post('/transfer', body);
  return response.data;
};

/**
 * Add a new card (body: cardType?: 'debit'|'credit', brand?: 'Visa'|'Mastercard')
 */
export const addCard = async (body = {}) => {
  const response = await api.post('/cards', body);
  return response.data;
};

export default api;
