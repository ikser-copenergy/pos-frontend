import { API_BASE } from "@/core/config";
import type { LoginResponse } from "./types";

export async function loginRequest(
  email: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  if (!body.success) {
    const msg = body.errors?.length ? body.errors.join(", ") : body.message;
    throw new Error(msg);
  }
  return body.data as LoginResponse;
}

export async function meRequest(token: string): Promise<LoginResponse["user"]> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  if (!body.success) {
    throw new Error("Sesión expirada");
  }
  return body.data;
}
