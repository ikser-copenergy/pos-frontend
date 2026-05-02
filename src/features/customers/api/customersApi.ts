import { apiFetch } from "@/api/client";
import type {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
  PaginatedCustomers,
} from "../types/customer.types";

export const customersApi = {
  getAll: (
    tenantId?: string,
    options?: { search?: string }
  ): Promise<Customer[]> => {
    const params = new URLSearchParams();
    if (tenantId) params.set("tenantId", tenantId);
    if (options?.search) params.set("search", options.search);
    const qs = params.toString();
    return apiFetch<Customer[]>(`/customers${qs ? `?${qs}` : ""}`);
  },

  getAllPaginated: (
    tenantId: string | undefined,
    page: number,
    limit: number
  ): Promise<PaginatedCustomers> => {
    const params = new URLSearchParams();
    if (tenantId) params.set("tenantId", tenantId);
    params.set("page", String(page));
    params.set("limit", String(limit));
    return apiFetch<PaginatedCustomers>(`/customers?${params}`);
  },

  getById: (id: string): Promise<Customer> =>
    apiFetch<Customer>(`/customers/${id}`),

  create: (data: CreateCustomerInput): Promise<Customer> =>
    apiFetch<Customer>("/customers", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateCustomerInput): Promise<Customer> =>
    apiFetch<Customer>(`/customers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    apiFetch<void>(`/customers/${id}`, { method: "DELETE" }),
};
