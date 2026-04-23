import { useCallback, useEffect, useState } from "react";
import { taxesApi } from "../api/taxesApi";
import type { CreateTaxInput, Tax, UpdateTaxInput } from "../types/tax.types";

export function useTaxes(tenantId?: string) {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTaxes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taxesApi.getAll(tenantId);
      setTaxes(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar impuestos");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchTaxes();
  }, [fetchTaxes]);

  const create = useCallback(async (data: CreateTaxInput) => {
    const created = await taxesApi.create(data);
    setTaxes((prev) => [...prev, created]);
    return created;
  }, []);

  const update = useCallback(async (id: string, data: UpdateTaxInput) => {
    const updated = await taxesApi.update(id, data);
    setTaxes((prev) => prev.map((tax) => (tax.id === id ? updated : tax)));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await taxesApi.delete(id);
    setTaxes((prev) => prev.filter((tax) => tax.id !== id));
  }, []);

  return { taxes, loading, error, refetch: fetchTaxes, create, update, remove };
}
