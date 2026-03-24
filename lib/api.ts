import { API_BASE_URL } from "@/constants/config";
import { storage } from "@/lib/storage";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "et_access_token",
  ID_TOKEN: "et_id_token",
  REFRESH_TOKEN: "et_refresh_token",
  USERNAME: "et_username",
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// ── Request interceptor: attach Bearer token ──────────────────────────────────
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    console.log(
      `📡 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
    );
    const token = await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  },
);

// ── Response interceptor: handle 401 + token refresh ─────────────────────────
let isRefreshing = false;
type QueueItem = {
  resolve: (val: string) => void;
  reject: (err: unknown) => void;
};
let failedQueue: QueueItem[] = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token!),
  );
  failedQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !original?._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        const username = await storage.getItem(STORAGE_KEYS.USERNAME);

        if (!refreshToken || !username) throw new Error("No credentials");

        const { data } = await axios.post(`${API_BASE_URL}/Auth/refresh`, {
          refreshToken,
          username,
        });

        await storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
        api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
        processQueue(null, data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (err) {
        processQueue(err, null);
        // Clear tokens on refresh failure
        await Promise.all(
          Object.values(STORAGE_KEYS).map((k) =>
            storage.deleteItem(k).catch(() => {
              // Ignore deletion errors
            }),
          ),
        ).catch(() => {
          // Ignore Promise.all errors
        });
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
