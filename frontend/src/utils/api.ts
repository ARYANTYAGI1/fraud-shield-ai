import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token refresh on 403 / token expired
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is due to token expiration (403 forbidden or 401 unauthorized)
    if (
      (error.response?.status === 403 || error.response?.status === 401) &&
      !originalRequest._retry &&
      typeof window !== 'undefined'
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/auth/refresh`, { token: refreshToken });
          if (res.status === 200) {
            const { accessToken, refreshToken: newRefreshToken } = res.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return api(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, log out
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
