import { apiFetch } from "@/api/client";
import type {
  Location,
  CreateLocationInput,
  UpdateLocationInput,
} from "../types/location.types";

export const locationsApi = {
  getAll: (tenantId?: string): Promise<Location[]> => {
    const qs = tenantId ? `?tenantId=${tenantId}` : "";
    return apiFetch<Location[]>(`/locations${qs}`);
  },

  getById: (id: string): Promise<Location> =>
    apiFetch<Location>(`/locations/${id}`),

  create: (data: CreateLocationInput): Promise<Location> =>
    apiFetch<Location>("/locations", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateLocationInput): Promise<Location> =>
    apiFetch<Location>(`/locations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    apiFetch<void>(`/locations/${id}`, { method: "DELETE" }),
};
