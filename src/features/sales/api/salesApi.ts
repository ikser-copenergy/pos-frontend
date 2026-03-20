import { apiFetch } from "@/api/client";
import type { Sale, CreateSaleInput } from "../types/sale.types";

export const salesApi = {
  getAll: (tenantId?: string): Promise<Sale[]> => {
    const qs = tenantId ? `?tenantId=${tenantId}` : "";
    return apiFetch<Sale[]>(`/sales${qs}`);
  },

  getById: (id: string): Promise<Sale> =>
    apiFetch<Sale>(`/sales/${id}`),

  create: (data: CreateSaleInput): Promise<Sale> =>
    apiFetch<Sale>("/sales", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  addPayment: (
    saleId: string,
    data: { method: "CASH" | "TRANSFER" | "CARD"; amount: number; reference?: string }
  ): Promise<Sale> =>
    apiFetch<Sale>(`/sales/${saleId}/payments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
