import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dashboard API
export const dashboardAPI = {
  getOverview: () => api.get('/dashboard/overview'),
  getRevenue: (period = 'day', days = 30) => api.get(`/dashboard/revenue?period=${period}&days=${days}`),
  getRevenueByCategory: () => api.get('/dashboard/revenue/category'),
  getTopProducts: (limit = 10) => api.get(`/dashboard/products/top?limit=${limit}`),
  getLowStockProducts: (threshold = 20) => api.get(`/dashboard/products/low-stock?threshold=${threshold}`),
  getCustomerAnalytics: () => api.get('/dashboard/customers'),
  getOrderAnalytics: () => api.get('/dashboard/orders'),
};

// Products API
export const productsAPI = {
  getAll: (page = 1, limit = 20, search = '') => 
    api.get(`/products?page=${page}&limit=${limit}&search=${search}`),
  getById: (id) => api.get(`/products/${id}`),
};

// Customers API
export const customersAPI = {
  getAll: (page = 1, limit = 20, search = '') => 
    api.get(`/customers?page=${page}&limit=${limit}&search=${search}`),
  getById: (id) => api.get(`/customers/${id}`),
};

// Orders API
export const ordersAPI = {
  getAll: (page = 1, limit = 20, status = '', search = '') => 
    api.get(`/orders?page=${page}&limit=${limit}&status=${status}&search=${search}`),
  getById: (id) => api.get(`/orders/${id}`),
};

export default api;
