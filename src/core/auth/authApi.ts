import { API_BASE } from "@/core/config";
import type { LoginResponse } from "./types";

export interface RegisterInput {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
  };
  tenant: { name: string; logo?: File };
}

export async function registerRequest(
  data: RegisterInput
): Promise<LoginResponse> {
  const hasLogo = data.tenant.logo instanceof File;
  let res: Response;

  if (hasLogo && data.tenant.logo) {
    const formData = new FormData();
    formData.append("user", JSON.stringify(data.user));
    formData.append("tenant", JSON.stringify({ name: data.tenant.name }));
    formData.append("logo", data.tenant.logo);
    res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      body: formData,
    });
  } else {
    res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: data.user,
        tenant: { name: data.tenant.name },
      }),
    });
  }
  const body = await res.json();
  if (!body.success) {
    const msg = body.errors?.length ? body.errors.join(", ") : body.message;
    throw new Error(msg);
  }
  return body.data as LoginResponse;
}

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
