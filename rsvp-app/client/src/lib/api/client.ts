import axios from 'axios';

let refreshPromise: Promise<string | null> | null = null;

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

let getToken: (() => string | null) | null = null;
let doRefresh: (() => Promise<string | null>) | null = null;

export function setupInterceptors(
  tokenGetter: () => string | null,
  refreshFn: () => Promise<string | null>
) {
  getToken = tokenGetter;
  doRefresh = refreshFn;
}

apiClient.interceptors.request.use((config) => {
  const token = getToken?.();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && doRefresh) {
      original._retry = true;
      if (!refreshPromise) {
        refreshPromise = doRefresh().finally(() => {
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      }
    }
    return Promise.reject(error);
  }
);
