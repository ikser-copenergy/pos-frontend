import { apiFetch } from "@/api/client";
import type { Setting, UpsertSettingInput } from "../types/settings.types";

export const settingsApi = {
  getAll: (tenantId: string): Promise<Setting[]> =>
    apiFetch<Setting[]>(`/settings?tenantId=${tenantId}`),

  getByKey: (tenantId: string, key: string): Promise<Setting> =>
    apiFetch<Setting>(`/settings/${encodeURIComponent(key)}?tenantId=${tenantId}`),

  upsert: (data: UpsertSettingInput): Promise<Setting> =>
    apiFetch<Setting>("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (tenantId: string, key: string): Promise<void> =>
    apiFetch<void>(`/settings/${encodeURIComponent(key)}?tenantId=${tenantId}`, {
      method: "DELETE",
    }),
};
