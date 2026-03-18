import { apiFetch } from "@/api/client";
import type { Product } from "../types/inventory.types";

export const productsApi = {
  getAll: (tenantId?: string): Promise<Product[]> => {
    const qs = tenantId ? `?tenantId=${tenantId}` : "";
    return apiFetch<Product[]>(`/products${qs}`);
  },
};
