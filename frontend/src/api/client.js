import axios from 'axios';

const BACKEND_URL = 'http://localhost:3000'; // Hardcoded for local dev based on GITHUB_CALLBACK_URL

export const apiClient = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true, // Crucial for sending/receiving the HttpOnly refresh token cookie
});

// Response interceptor to handle automatic token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 (Unauthorized) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token using the HttpOnly cookie
        const res = await axios.post(`${BACKEND_URL}/api/auth/refresh`, {}, {
          withCredentials: true
        });

        const newAccessToken = res.data.accessToken;

        // Note: The AuthContext manages the token globally, but we could 
        // inject it into the headers here if we used Authorization headers.
        // For now, if refresh succeeds, we just retry the request.
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed (e.g., token expired or revoked).
        // The user needs to log in again.
        console.error('Session expired. Please log in again.');
        // Event can be dispatched here to clear context, or AuthContext handles it.
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
