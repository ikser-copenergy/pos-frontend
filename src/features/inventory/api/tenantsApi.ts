import { apiFetch } from "@/api/client";

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  logoUrl?: string | null;
}

export const tenantsApi = {
  getAll: () => apiFetch<Tenant[]>("/tenants"),
  updateLogo: (file: File): Promise<Tenant> => {
    const formData = new FormData();
    formData.append("logo", file);
    return apiFetch<Tenant>("/tenants/me/logo", {
      method: "PATCH",
      body: formData,
    });
  },
};
