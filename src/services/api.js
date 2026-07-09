import axios from 'axios';

// Get base URL from environment variables, fallback to local backend default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer Token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('walletwiz_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors (like 401 Unauthorized or 429 Rate Limit)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // 401 Unauthorized: Session expired or invalid
      if (status === 401) {
        localStorage.removeItem('walletwiz_token');
        // Dispatch custom event to notify AuthContext to clean up session
        window.dispatchEvent(new Event('auth-expired'));
      }

      // 429 Too Many Requests: Rate Limiting
      if (status === 429) {
        // Dispatch custom event for a Toast Notification to capture and display
        window.dispatchEvent(new CustomEvent('rate-limited', {
          detail: { message: error.response.data?.detail || 'Rate limit exceeded: 20 requests per minute.' }
        }));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
