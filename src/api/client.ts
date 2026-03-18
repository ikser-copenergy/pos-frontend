import { API_BASE } from "@/core/config";
import type { ApiResponse } from "pos-backend/shared";

export type { ApiResponse };

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const isFormData = options?.body instanceof FormData;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options?.headers as Record<string, string>),
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
  });

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
