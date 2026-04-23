import { apiFetch } from "@/api/client";
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
} from "../types/product.types";

export const productsApi = {
  getAll: (
    tenantId?: string,
    options?: { includeArchived?: boolean; search?: string }
  ): Promise<Product[]> => {
    const params = new URLSearchParams();
    if (tenantId) params.set("tenantId", tenantId);
    if (options?.includeArchived) params.set("includeArchived", "true");
    if (options?.search) params.set("search", options.search);

    const qs = params.toString();
    return apiFetch<Product[]>(`/products${qs ? `?${qs}` : ""}`);
  },

  getById: (id: string): Promise<Product> =>
    apiFetch<Product>(`/products/${id}`),

  create: (data: CreateProductInput): Promise<Product> =>
    apiFetch<Product>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateProductInput): Promise<Product> =>
    apiFetch<Product>(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  archive: (id: string): Promise<Product> =>
    apiFetch<Product>(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ archived: true }),
    }),

  uploadImage: (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("image", file);
    return apiFetch<{ url: string }>("/uploads", {
      method: "POST",
      body: formData,
    });
  },
};
