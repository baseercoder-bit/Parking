import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error details for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message,
        code: error.code,
      });
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface Location {
  id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string | null;
}

export interface Zone {
  id: string;
  locationId: string;
  name: string;
  description?: string | null;
  totalSpots: number;
  occupiedSpots: number;
  createdAt: string;
  updatedAt: string;
}

export interface LocationWithZones extends Location {
  zones: Zone[];
}

export interface LocationStats {
  locationId: string;
  locationName: string;
  totalSpots: number;
  occupiedSpots: number;
  availableSpots: number;
  zones: Array<{
    id: string;
    name: string;
    totalSpots: number;
    occupiedSpots: number;
    availableSpots: number;
  }>;
}

export const locationsApi = {
  getAll: () => api.get<Location[]>('/locations'),
  getById: (locationId: string) => api.get<LocationWithZones>(`/locations/${locationId}`),
  getStats: (locationId: string) => api.get<LocationStats>(`/locations/${locationId}/stats`),
  updateImage: (locationId: string, imageUrl: string | null) =>
    api.put<Location>(`/locations/${locationId}/image`, { imageUrl }),
};

export const zonesApi = {
  getByLocation: (locationId: string) => api.get<Zone[]>(`/zones/${locationId}`),
  create: (data: { name: string; description?: string; totalSpots: number; locationId?: string }) =>
    api.post<Zone>('/zones', data),
  update: (zoneId: string, data: { name?: string; description?: string; totalSpots?: number }) =>
    api.put<Zone>(`/zones/${zoneId}`, data),
  updateSpots: (zoneId: string, occupiedSpots: number) =>
    api.put<Zone>(`/zones/${zoneId}/spots`, { occupiedSpots }),
  delete: (zoneId: string) => api.delete(`/zones/${zoneId}`),
};

export const authApi = {
  login: (username: string, password: string) =>
    api.post<{ token: string; admin: { id: string; username: string; locationId: string; locationName: string } }>(
      '/auth/login',
      { username, password }
    ),
};

export default api;

