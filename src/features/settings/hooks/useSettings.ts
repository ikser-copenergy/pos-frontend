import { useState, useEffect, useCallback } from "react";
import { settingsApi } from "../api/settingsApi";
import type { Setting, UpsertSettingInput } from "../types/settings.types";

export function useSettings(tenantId: string | undefined) {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await settingsApi.getAll(tenantId);
      setSettings(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar configuraciones");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const getValue = useCallback(
    (key: string) => settings.find((s) => s.key === key)?.value ?? "",
    [settings]
  );

  const upsert = useCallback(async (data: UpsertSettingInput) => {
    const updated = await settingsApi.upsert(data);
    setSettings((prev) => {
      const existing = prev.findIndex((s) => s.key === data.key);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = updated;
        return next;
      }
      return [...prev, updated];
    });
    return updated;
  }, []);

  const remove = useCallback(async (key: string) => {
    if (!tenantId) return;
    await settingsApi.delete(tenantId, key);
    setSettings((prev) => prev.filter((s) => s.key !== key));
  }, [tenantId]);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
    getValue,
    upsert,
    remove,
  };
}
