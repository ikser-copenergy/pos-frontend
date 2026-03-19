import { apiFetch } from "@/api/client";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const usersApi = {
  getAll: (tenantId?: string): Promise<User[]> => {
    const qs = tenantId ? `?tenantId=${tenantId}` : "";
    return apiFetch<User[]>(`/users${qs}`);
  },
};
