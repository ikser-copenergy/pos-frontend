import { apiFetch } from "@/api/client";
import type { CreateTaxInput, Tax, UpdateTaxInput } from "../types/tax.types";

export const taxesApi = {
  getAll: (tenantId?: string): Promise<Tax[]> => {
    const qs = tenantId ? `?tenantId=${tenantId}` : "";
    return apiFetch<Tax[]>(`/taxes${qs}`);
  },

  create: (data: CreateTaxInput): Promise<Tax> =>
    apiFetch<Tax>("/taxes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateTaxInput): Promise<Tax> =>
    apiFetch<Tax>(`/taxes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    apiFetch<void>(`/taxes/${id}`, { method: "DELETE" }),
};
