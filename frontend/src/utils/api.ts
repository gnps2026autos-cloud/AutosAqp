import axios from 'axios';
import { User, Vehicle, VehicleCreate, FilterOptions } from '../types';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL + '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  createSession: async (sessionId: string): Promise<User> => {
    const response = await api.post('/auth/session', { session_id: sessionId });
    return response.data;
  },
  getMe: async (token?: string): Promise<User> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get('/auth/me', { headers });
    return response.data;
  },
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
  updateProfile: async (data: { name?: string; phone?: string; picture?: string }, token?: string): Promise<User> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.put('/auth/profile', data, { headers });
    return response.data;
  },
};

// Vehicles API
export const vehiclesAPI = {
  getAll: async (filters?: FilterOptions): Promise<Vehicle[]> => {
    const response = await api.get('/vehicles', { params: filters });
    return response.data;
  },
  getById: async (id: string): Promise<Vehicle> => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },
  create: async (data: VehicleCreate, token?: string): Promise<Vehicle> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post('/vehicles', data, { headers });
    return response.data;
  },
  update: async (id: string, data: Partial<VehicleCreate>, token?: string): Promise<Vehicle> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.put(`/vehicles/${id}`, data, { headers });
    return response.data;
  },
  delete: async (id: string, token?: string): Promise<void> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await api.delete(`/vehicles/${id}`, { headers });
  },
  getMyVehicles: async (token?: string): Promise<Vehicle[]> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get('/vehicles/user/my-vehicles', { headers });
    return response.data;
  },
};

// Favorites API
export const favoritesAPI = {
  add: async (vehicleId: string, token?: string): Promise<void> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await api.post(`/favorites/${vehicleId}`, {}, { headers });
  },
  remove: async (vehicleId: string, token?: string): Promise<void> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await api.delete(`/favorites/${vehicleId}`, { headers });
  },
  getAll: async (token?: string): Promise<Vehicle[]> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get('/favorites', { headers });
    return response.data;
  },
  check: async (vehicleId: string, token?: string): Promise<boolean> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get(`/favorites/check/${vehicleId}`, { headers });
    return response.data.is_favorite;
  },
};

// Payments API
export const paymentsAPI = {
  getConfig: async (): Promise<any> => {
    const response = await api.get('/payments/config');
    return response.data;
  },
  promote: async (vehicleId: string, tipoPago: string, numeroOperacion: string, token?: string, etiqueta?: string): Promise<any> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post(`/vehicles/${vehicleId}/promote`, {
      tipo_pago: tipoPago,
      numero_operacion: numeroOperacion,
      etiqueta: etiqueta || 'destacado',
    }, { headers });
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  login: async (pin: string): Promise<any> => {
    const response = await api.post('/admin/login', { pin });
    return response.data;
  },
  getPayments: async (pin: string, estado?: string): Promise<any> => {
    const headers = { 'X-Admin-Pin': pin };
    const params: any = {};
    if (estado) params.estado = estado;
    const response = await api.get('/admin/payments', { headers, params });
    return response.data;
  },
  verifyPayment: async (pin: string, paymentId: string, estado: string): Promise<any> => {
    const headers = { 'X-Admin-Pin': pin };
    const response = await api.put(`/admin/payments/${paymentId}/verify`, { estado }, { headers });
    return response.data;
  },
};

export default api;