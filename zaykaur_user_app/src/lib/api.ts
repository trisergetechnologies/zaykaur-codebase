import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";
import type { ApiResponse } from "../types/api";

const TOKEN_KEY = "zaykaur_token";
const API_V1 = "/api/v1";
const REQUEST_TIMEOUT_MS = 15000;
const DEFAULT_API_PORT = "4000";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, "");
}

function isLoopbackUrl(url: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(url.trim());
}

function extractHostFromExpoDevServer(): string | null {
  const constants = Constants as unknown as {
    expoConfig?: { hostUri?: string };
    manifest2?: { extra?: { expoClient?: { hostUri?: string } } };
    manifest?: { debuggerHost?: string };
  };

  const hostUri =
    constants.expoConfig?.hostUri ??
    constants.manifest2?.extra?.expoClient?.hostUri ??
    constants.manifest?.debuggerHost ??
    null;

  if (!hostUri) return null;
  const host = hostUri.split(":")[0];
  return host || null;
}

function getApiBaseUrl(): string {
  const configured =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_API_URL ?? "";
  const configuredUrl = configured.trim();

  // Use explicit non-localhost config as-is.
  if (configuredUrl && !isLoopbackUrl(configuredUrl)) {
    return normalizeBaseUrl(configuredUrl);
  }

  // In Expo Go, use the Metro host IP so physical devices can reach backend.
  const lanHost = extractHostFromExpoDevServer();
  if (lanHost) {
    return `http://${lanHost}:${DEFAULT_API_PORT}`;
  }

  // Android emulator loopback alias.
  if (Platform.OS === "android") {
    return `http://10.0.2.2:${DEFAULT_API_PORT}`;
  }

  return `http://localhost:${DEFAULT_API_PORT}`;
}

async function withTimeout(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) headers.Authorization = `Bearer ${token}`;
  } catch {
    // ignore storage errors
  }

  return headers;
}

export async function setStoredToken(token: string | null): Promise<void> {
  try {
    if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
    else await AsyncStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore storage errors
  }
}

async function handleRes<T>(res: Response): Promise<ApiResponse<T>> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      success: false,
      message:
        (json as { message?: string })?.message || res.statusText || "Request failed",
      data: null,
    };
  }
  return json as ApiResponse<T>;
}

async function request<T>(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  path: string,
  body?: unknown,
  params?: Record<string, string | number | undefined>
): Promise<ApiResponse<T>> {
  const baseUrl = getApiBaseUrl();
  const headers = await getAuthHeaders();
  const url = new URL(baseUrl + API_V1 + path);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  try {
    const res = await withTimeout(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleRes<T>(res);
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "Request timed out. Please try again."
        : `Unable to connect to ${baseUrl}. If you are on a physical device, use your laptop LAN IP for EXPO_PUBLIC_API_URL (example: http://192.168.1.10:4000).`;

    return {
      success: false,
      message,
      data: null,
    };
  }
}

export const api = {
  get<T>(path: string, params?: Record<string, string | number | undefined>) {
    return request<T>("GET", path, undefined, params);
  },
  post<T>(path: string, body?: unknown) {
    return request<T>("POST", path, body);
  },
  put<T>(path: string, body?: unknown) {
    return request<T>("PUT", path, body);
  },
  delete<T>(path: string) {
    return request<T>("DELETE", path);
  },
  patch<T>(path: string, body?: unknown) {
    return request<T>("PATCH", path, body);
  },
};
