import axios, { InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";
import { useCampusStore } from "@/store/campusStore";

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
  const { accessToken, user } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // Inject campus scope for SUPER_ADMIN (the global campus picker in the topbar).
  // Only inject when no campusId is already explicitly set by the calling code.
  // ADMIN: never inject — the backend enforces their campus at the middleware level.
  if (user?.role === 'SUPER_ADMIN') {
    const activeCampusId = useCampusStore.getState().activeCampusId
    if (activeCampusId && config.params?.campusId === undefined) {
      config.params = { ...config.params, campusId: activeCampusId }
    }
  }

  // LOGGING OUTGOING REQUEST
  const method = config.method?.toUpperCase() ?? 'UNKNOWN'
  const url = config.url ?? ''
  const params = config.params ? ` | Params: ${JSON.stringify(config.params)}` : ''
  const data = config.data
    ? (() => {
        const sanitized = { ...config.data }
        if (sanitized.password) sanitized.password = '[REDACTED]'
        if (sanitized.passwordHash) sanitized.passwordHash = '[REDACTED]'
        return ` | Body: ${JSON.stringify(sanitized)}`
      })()
    : ''
  console.log(`%c[API →] ${method} ${url}${params}${data}`, 'color: #3B82F6; font-weight: bold')

  return config;
}, (error) => {
  console.error('%c[API REQUEST ERROR]', 'color: #EF4444; font-weight: bold', error)
  return Promise.reject(error)
});

// ─── Response interceptor ─────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    // LOGGING INCOMING RESPONSE
    const method = response.config.method?.toUpperCase() ?? 'UNKNOWN'
    const url = response.config.url ?? ''
    const status = response.status
    console.log(`%c[API ←] ${status} ${method} ${url}`, 'color: #10B981; font-weight: bold')
    return response;
  },
  async (error) => {
    // LOGGING ERROR
    const method = error.config?.method?.toUpperCase() ?? 'UNKNOWN'
    const url = error.config?.url ?? ''
    const status = error.response?.status ?? 'NETWORK_ERROR'
    const message = error.response?.data?.message ?? error.message ?? 'Unknown error'
    const details = error.response?.data?.details ?? null

    console.group(`%c[API ERROR] ${status} ${method} ${url}`, 'color: #EF4444; font-weight: bold')
    console.error('Message:', message)
    if (details) console.error('Validation details:', details)
    if (status === 401) console.warn('→ UNAUTHORIZED: Token expired or invalid')
    if (status === 403) console.warn('→ FORBIDDEN: Insufficient role permissions')
    if (status === 404) console.warn('→ NOT FOUND: Check endpoint URL and ID')
    if (status === 409) console.warn('→ CONFLICT: Duplicate data — check unique fields')
    if (status === 422) console.warn('→ VALIDATION: Form data rejected — check field names and types')
    if (status === 500) console.warn('→ SERVER ERROR: Check backend console for details')
    if (status === 'NETWORK_ERROR') console.warn('→ NETWORK: Cannot reach server — is backend running?')
    console.groupEnd()

    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest) {
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
