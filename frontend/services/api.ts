import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/api/auth/register', data),
  login: (data: any) => api.post('/api/auth/login', data),
  getProfile: () => api.get('/api/auth/me'),
  updateProfile: (data: any) => api.put('/api/auth/update-profile', data),
  forgotPassword: (email: string) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.put(`/api/auth/reset-password/${token}`, { password }),
  changePassword: (currentPassword: string, newPassword: string) => api.put('/api/auth/change-password', { currentPassword, newPassword }),
};

// Appointments API
export const appointmentsAPI = {
  getAll: (params?: any) => api.get('/api/appointments', { params }),
  getById: (id: string) => api.get(`/api/appointments/${id}`),
  create: (data: any) => api.post('/api/appointments', data),
  update: (id: string, data: any) => api.put(`/api/appointments/${id}`, data),
  cancel: (id: string, reason: string) => api.put(`/api/appointments/${id}/cancel`, { reason }),
  reschedule: (id: string, data: any) => api.put(`/api/appointments/${id}/reschedule`, data),
  complete: (id: string, data: any) => api.put(`/api/appointments/${id}/complete`, data),
};

// Doctors API
export const doctorsAPI = {
  getAll: (params?: any) => api.get('/api/doctors', { params }),
  getById: (id: string) => api.get(`/api/doctors/${id}`),
  getAvailability: (id: string, date: string) => api.get(`/api/doctors/${id}/availability`, { params: { date } }),
  updateAvailability: (id: string, availability: any) => api.put(`/api/doctors/${id}/availability`, { availability }),
  getAppointments: (id: string, params?: any) => api.get(`/api/doctors/${id}/appointments`, { params }),
  getSpecializations: () => api.get('/api/doctors/meta/specializations'),
};

// Queue API
export const queueAPI = {
  getAll: (params?: any) => api.get('/api/queue', { params }),
  getById: (id: string) => api.get(`/api/queue/${id}`),
  checkIn: (appointmentId: string) => api.post('/api/queue/check-in', { appointmentId }),
  walkIn: (data: any) => api.post('/api/queue/walk-in', data),
  callNext: (id: string) => api.put(`/api/queue/${id}/call-next`),
  complete: (id: string) => api.put(`/api/queue/${id}/complete`),
  getPatientStatus: () => api.get('/api/queue/status/patient'),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/api/users'),
  getById: (id: string) => api.get(`/api/users/${id}`),
  getDoctors: () => api.get('/api/users/doctors'),
  getPatients: () => api.get('/api/users/patients'),
};

// Medical Records API
export const medicalRecordsAPI = {
  getAll: (params?: any) => api.get('/api/medical-records', { params }),
  getById: (id: string) => api.get(`/api/medical-records/${id}`),
  create: (data: any) => api.post('/api/medical-records', data),
  update: (id: string, data: any) => api.put(`/api/medical-records/${id}`, data),
  delete: (id: string) => api.delete(`/api/medical-records/${id}`),
  getPatientSummary: (patientId: string) => api.get(`/api/medical-records/patient/${patientId}/summary`),
};
