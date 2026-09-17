import axios from 'axios';
import { API_BASE_URL } from './config';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from '../utils/tokenStorage';

// Fires whenever the refresh token is rejected/expired so AuthContext can
// drop the session and send the user back to the auth stack.
let onSessionExpired = () => {};
export function setSessionExpiredHandler(handler) {
  onSessionExpired = handler;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
  await saveTokens(data.data);
  return data.data.accessToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const isAuthEndpoint = config?.url?.includes('/auth/');

    if (response?.status === 401 && !config._retried && !isAuthEndpoint) {
      config._retried = true;
      try {
        refreshPromise = refreshPromise || refreshAccessToken();
        const newAccessToken = await refreshPromise;
        refreshPromise = null;
        config.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(config);
      } catch (refreshError) {
        refreshPromise = null;
        await clearTokens();
        onSessionExpired();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Normalizes both the ApiResponse success envelope ({ data: { data } }) and
// the ApiError failure envelope into a plain message for UI display.
export function extractErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.errors?.[0]?.message ||
    error?.message ||
    'Something went wrong. Please try again.'
  );
}

export default apiClient;
