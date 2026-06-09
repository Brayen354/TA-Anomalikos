import type { ApiResponse } from "@/types";

const BASE = "/api";

const TOKEN_KEY = "pk_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;
  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

type Options = {
  method?: string;
  body?: unknown;
  auth?: boolean;
};

export async function apiFetch<T = unknown>(
  path: string,
  opts: Options = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, auth = true } = opts;

  const isForm = typeof FormData !== "undefined" && body instanceof FormData;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body:
        body === undefined
          ? undefined
          : isForm
          ? (body as FormData)
          : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "Tidak dapat terhubung ke server. Pastikan backend Laravel berjalan.",
      0
    );
  }

  let json: ApiResponse<T> | null = null;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    json = null;
  }

  if (!res.ok || (json && json.status === false)) {
    const message =
      json?.message ||
      (res.status === 401
        ? "Silakan login terlebih dahulu."
        : "Terjadi kesalahan pada server.");
    throw new ApiError(message, res.status, json?.errors);
  }

  return json ?? ({ status: true } as ApiResponse<T>);
}

export const api = {
  get: <T = unknown>(path: string, auth = true) => apiFetch<T>(path, { auth }),
  post: <T = unknown>(path: string, body?: unknown, auth = true) =>
    apiFetch<T>(path, { method: "POST", body, auth }),
  put: <T = unknown>(path: string, body?: unknown, auth = true) =>
    apiFetch<T>(path, { method: "PUT", body, auth }),
  del: <T = unknown>(path: string, auth = true) =>
    apiFetch<T>(path, { method: "DELETE", auth }),
};
