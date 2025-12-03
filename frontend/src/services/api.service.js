import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/';

// Create axios instance with interceptor
const axiosInstance = axios.create({
  baseURL: API_URL
});

// Add request interceptor to attach JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = 'Bearer ' + user.token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class ApiService {
  getAuthHeader() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      return { Authorization: 'Bearer ' + user.token };
    } else {
      return {};
    }
  }

  // User Management
  getAllUsers() {
    return axiosInstance.get('users');
  }

  deleteUser(id) {
    return axiosInstance.delete('users/' + id);
  }

  // Product Management
  getAllProducts() {
    return axiosInstance.get('products');
  }

  createProduct(product) {
    return axiosInstance.post('products', product);
  }

  updateProduct(id, product) {
    return axiosInstance.put('products/' + id, product);
  }

  deleteProduct(id) {
    return axiosInstance.delete('products/' + id);
  }

  // Invoice Management
  getAllInvoices() {
    return axiosInstance.get('invoices');
  }

  createInvoice(invoice) {
    return axiosInstance.post('invoices', invoice);
  }

  getInvoice(id) {
    return axiosInstance.get('invoices/' + id);
  }

  updateInvoice(id, invoice) {
    return axiosInstance.put('invoices/' + id, invoice);
  }

  updateInvoiceStatus(id, status) {
    return axiosInstance.put('invoices/' + id + '/status?status=' + status, {});
  }

  deleteInvoice(id) {
    return axiosInstance.delete('invoices/' + id);
  }

  // Client Management
  getAllClients() {
    return axiosInstance.get('clients');
  }

  getClient(id) {
    return axiosInstance.get('clients/' + id);
  }

  createClient(client) {
    return axiosInstance.post('clients', client);
  }

  updateClient(id, client) {
    return axiosInstance.put('clients/' + id, client);
  }

  deleteClient(id) {
    return axiosInstance.delete('clients/' + id);
  }

  // Company Settings
  getCompanySettings() {
    return axiosInstance.get('company');
  }

  updateCompanySettings(settings) {
    return axiosInstance.put('company', settings);
  }

  generateInvoiceNumber() {
    return axiosInstance.post('company/generate-invoice-number', {});
  }

  toggleUserStatus(id) {
    return axiosInstance.put('users/' + id + '/toggle-status', {});
  }

  // Activity Logs
  getAllActivityLogs() {
    return axiosInstance.get('activity-logs');
  }

  getActivityLogsPaginated(page, size) {
    return axiosInstance.get(`activity-logs/paginated?page=${page}&size=${size}`);
  }

  getActivityLogsByUsername(username) {
    return axiosInstance.get(`activity-logs/user/${username}`);
  }

  getActivityLogsByEntityType(entityType) {
    return axiosInstance.get(`activity-logs/entity/${entityType}`);
  }

  getActivityLogsByAction(action) {
    return axiosInstance.get(`activity-logs/action/${action}`);
  }

  getActivityLogsByDateRange(startDate, endDate) {
    return axiosInstance.get(`activity-logs/date-range?startDate=${startDate}&endDate=${endDate}`);
  }

  getActivityLogsByFilters(username, entityType, action) {
    const params = new URLSearchParams();
    if (username) params.append('username', username);
    if (entityType) params.append('entityType', entityType);
    if (action) params.append('action', action);
    return axiosInstance.get(`activity-logs/filter?${params.toString()}`);
  }

  getActivityLogsFilterOptions() {
    return axiosInstance.get('activity-logs/filters-options');
  }
}

export default new ApiService();
