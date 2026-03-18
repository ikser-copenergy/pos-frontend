import { apiFetch } from "@/api/client";
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../types/category.types";

export const categoriesApi = {
  getAll: (tenantId?: string): Promise<Category[]> => {
    const qs = tenantId ? `?tenantId=${tenantId}` : "";
    return apiFetch<Category[]>(`/categories${qs}`);
  },

  getById: (id: string): Promise<Category> =>
    apiFetch<Category>(`/categories/${id}`),

  create: (data: CreateCategoryInput): Promise<Category> =>
    apiFetch<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateCategoryInput): Promise<Category> =>
    apiFetch<Category>(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    apiFetch<void>(`/categories/${id}`, { method: "DELETE" }),
};
