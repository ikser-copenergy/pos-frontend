import { useState, useEffect, useCallback } from "react";
import { locationsApi } from "../api/locationsApi";
import type {
  Location,
  CreateLocationInput,
  UpdateLocationInput,
} from "../types/location.types";

export function useLocations(tenantId?: string) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await locationsApi.getAll(tenantId);
      setLocations(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar ubicaciones");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const create = useCallback(async (data: CreateLocationInput) => {
    const created = await locationsApi.create(data);
    setLocations((prev) => [...prev, created]);
    return created;
  }, []);

  const update = useCallback(async (id: string, data: UpdateLocationInput) => {
    const updated = await locationsApi.update(id, data);
    setLocations((prev) =>
      prev.map((loc) => (loc.id === id ? updated : loc))
    );
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await locationsApi.delete(id);
    setLocations((prev) => prev.filter((loc) => loc.id !== id));
  }, []);

  return {
    locations,
    loading,
    error,
    refetch: fetchLocations,
    create,
    update,
    remove,
  };
}
