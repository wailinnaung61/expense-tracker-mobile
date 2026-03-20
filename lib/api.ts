import { API_BASE_URL } from "@/constants/config";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";

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
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
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
        const refreshToken = await SecureStore.getItemAsync(
          STORAGE_KEYS.REFRESH_TOKEN,
        );
        const username = await SecureStore.getItemAsync(STORAGE_KEYS.USERNAME);

        if (!refreshToken || !username) throw new Error("No credentials");

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
          username,
        });

        await SecureStore.setItemAsync(
          STORAGE_KEYS.ACCESS_TOKEN,
          data.accessToken,
        );
        api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
        processQueue(null, data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (err) {
        processQueue(err, null);
        await Promise.all(
          Object.values(STORAGE_KEYS).map((k) =>
            SecureStore.deleteItemAsync(k),
          ),
        );
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
