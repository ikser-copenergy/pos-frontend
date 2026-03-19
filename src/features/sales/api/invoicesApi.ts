import { apiFetch } from "@/api/client";
import type { Invoice, CreateInvoiceInput } from "../types/invoice.types";

export const invoicesApi = {
  getAll: (tenantId?: string): Promise<Invoice[]> => {
    const qs = tenantId ? `?tenantId=${tenantId}` : "";
    return apiFetch<Invoice[]>(`/invoices${qs}`);
  },

  getById: (id: string): Promise<Invoice> =>
    apiFetch<Invoice>(`/invoices/${id}`),

  getBySaleId: (saleId: string): Promise<Invoice> =>
    apiFetch<Invoice>(`/invoices/sale/${saleId}`),

  create: (data: CreateInvoiceInput): Promise<Invoice> =>
    apiFetch<Invoice>("/invoices", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
