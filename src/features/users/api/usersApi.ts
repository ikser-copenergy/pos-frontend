import { apiFetch } from "@/api/client";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  status?: string;
  createdAt?: string;
  tenantId?: string;
  defaultLocationId: string;
  defaultLocation?: { id: string; name: string };
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  defaultLocationId: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phone?: string | null;
  password?: string;
  defaultLocationId?: string;
}

export const usersApi = {
  getAll: (): Promise<User[]> => apiFetch<User[]>("/users"),
  getById: (id: string): Promise<User> => apiFetch<User>(`/users/${id}`),
  countCashiers: (): Promise<{ count: number }> =>
    apiFetch<{ count: number }>("/users/count-cashiers"),
  create: (data: CreateUserInput): Promise<User> =>
    apiFetch<User>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateUserInput): Promise<User> =>
    apiFetch<User>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string): Promise<{ deleted: true }> =>
    apiFetch<{ deleted: true }>(`/users/${id}`, { method: "DELETE" }),
};
