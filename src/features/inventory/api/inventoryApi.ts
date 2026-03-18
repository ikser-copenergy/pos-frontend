import { apiFetch } from "@/api/client";
import type {
  InventoryItem,
  CreateInventoryInput,
  UpdateInventoryInput,
} from "../types/inventory.types";

export const inventoryApi = {
  getAll: (tenantId?: string): Promise<InventoryItem[]> => {
    const qs = tenantId ? `?tenantId=${tenantId}` : "";
    return apiFetch<InventoryItem[]>(`/inventory${qs}`);
  },

  getById: (id: string): Promise<InventoryItem> =>
    apiFetch<InventoryItem>(`/inventory/${id}`),

  create: (data: CreateInventoryInput): Promise<InventoryItem> =>
    apiFetch<InventoryItem>("/inventory", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateInventoryInput): Promise<InventoryItem> =>
    apiFetch<InventoryItem>(`/inventory/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    apiFetch<void>(`/inventory/${id}`, { method: "DELETE" }),
};
