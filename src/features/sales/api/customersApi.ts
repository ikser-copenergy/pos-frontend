import { apiFetch } from "@/api/client";

export interface Customer {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
}

export const customersApi = {
  getAll: (tenantId?: string): Promise<Customer[]> => {
    const qs = tenantId ? `?tenantId=${tenantId}` : "";
    return apiFetch<Customer[]>(`/customers${qs}`);
  },
};
