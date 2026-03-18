import { apiFetch } from "@/api/client";
import type { Location } from "../types/inventory.types";

export const locationsApi = {
  getAll: (tenantId?: string): Promise<Location[]> => {
    const qs = tenantId ? `?tenantId=${tenantId}` : "";
    return apiFetch<Location[]>(`/locations${qs}`);
  },
};
