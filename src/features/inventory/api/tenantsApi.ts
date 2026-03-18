import { apiFetch } from "@/api/client";

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
}

export const tenantsApi = {
  getAll: () => apiFetch<Tenant[]>("/tenants"),
};
