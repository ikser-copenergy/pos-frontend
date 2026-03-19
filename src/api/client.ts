import { API_BASE } from "@/core/config";
import type { ApiResponse } from "pos-backend/shared";

export type { ApiResponse };

const TOKEN_KEY = "pos_token";

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const isFormData = options?.body instanceof FormData;
  const token = localStorage.getItem(TOKEN_KEY);

  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = "/login";
    throw new Error("Sesión expirada");
  }

  const body = (await res.json().catch(() => null)) as ApiResponse<T> | null;

  if (!body) {
    throw new Error("Error de conexión");
  }

  if (!body.success) {
    const msg = body.errors?.length ? body.errors.join(", ") : body.message;
    throw new Error(msg);
  }

  return body.data as T;
}
