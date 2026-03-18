import { apiFetch } from "@/api/client";

export interface Category {
  id: string;
  name: string;
}

export const categoriesApi = {
  getAll: (tenantId?: string): Promise<Category[]> => {
    const qs = tenantId ? `?tenantId=${tenantId}` : "";
    return apiFetch<Category[]>(`/categories${qs}`);
  },
};
