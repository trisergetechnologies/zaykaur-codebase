const API_BASE =
  typeof window !== "undefined"
    ? ""
    : (process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:4000");

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  let json: ApiResponse<T>;
  try {
    json = text ? (JSON.parse(text) as ApiResponse<T>) : { success: false, message: "Empty response", data: null as T };
  } catch {
    json = {
      success: false,
      message: text?.slice(0, 200) || res.statusText || "Invalid response",
      data: null as T,
    };
  }

  if (!res.ok && json.success) {
    json.success = false;
    if (!json.message) json.message = `Request failed (${res.status})`;
  }

  return json;
}

export async function apiGet<T = unknown>(
  path: string,
  options?: Omit<RequestInit, "method">
): Promise<ApiResponse<T>> {
  return api<T>(path, { ...options, method: "GET" });
}

export async function apiPost<T = unknown>(
  path: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return api<T>(path, {
    method: "POST",
    body: body != null ? JSON.stringify(body) : undefined,
  });
}

/** POST multipart (e.g. file upload). Do not set Content-Type; the browser sets the boundary. */
export async function apiPostFormData<T = unknown>(
  path: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  return api<T>(path, { method: "POST", body: formData });
}

export async function apiPut<T = unknown>(
  path: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return api<T>(path, {
    method: "PUT",
    body: body != null ? JSON.stringify(body) : undefined,
  });
}

export async function apiPatch<T = unknown>(
  path: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return api<T>(path, {
    method: "PATCH",
    body: body != null ? JSON.stringify(body) : undefined,
  });
}

export async function apiDelete<T = unknown>(path: string): Promise<ApiResponse<T>> {
  return api<T>(path, { method: "DELETE" });
}
