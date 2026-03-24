import axios, { InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
  withCredentials: true,
});

let isRefreshing = false;
let failedRequestQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any) => {
  failedRequestQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedRequestQueue = [];
};

// ─── Request interceptor ──────────────────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ─── Response interceptor ─────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      if (originalRequest._retry) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { logout, setTokens } = useAuthStore.getState();

      try {
        const { data } = await axios.post<{ data: { accessToken: string; refreshToken?: string } }>(
          `${API_BASE}/auth/refresh-token`,
          {},
          { headers: { "Content-Type": "application/json" }, timeout: 15000, withCredentials: true }
        );

        const newAccessToken = data.data.accessToken;
        const newRefreshToken = data.data.refreshToken || null;

        setTokens(newAccessToken, newRefreshToken);
        processQueue(null);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        logout();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
