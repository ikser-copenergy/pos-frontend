import { useState, useEffect, useCallback } from "react";
import { inventoryApi } from "../api/inventoryApi";
import { productsApi } from "../api/productsApi";
import { locationsApi } from "../api/locationsApi";
import { tenantsApi } from "../api/tenantsApi";
import type {
  InventoryItem,
  CreateInventoryInput,
  UpdateInventoryInput,
} from "../types/inventory.types";
import type { Tenant } from "../api/tenantsApi";

export function useInventory(tenantId?: string) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryApi.getAll(tenantId);
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar inventario");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const create = useCallback(
    async (data: CreateInventoryInput) => {
      const created = await inventoryApi.create(data);
      setItems((prev) => [...prev, created]);
      return created;
    },
    []
  );

  const update = useCallback(async (id: string, data: UpdateInventoryInput) => {
    const updated = await inventoryApi.update(id, data);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? updated : item))
    );
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await inventoryApi.delete(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return { items, loading, error, refetch: fetchItems, create, update, remove };
}

export function useProducts(tenantId?: string) {
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi.getAll(tenantId).then((data) => {
      setProducts(data.map((p) => ({ id: p.id, name: p.name })));
      setLoading(false);
    });
  }, [tenantId]);

  return { products, loading };
}

export function useLocations(tenantId?: string) {
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    locationsApi.getAll(tenantId).then((data) => {
      setLocations(data.map((l) => ({ id: l.id, name: l.name })));
      setLoading(false);
    });
  }, [tenantId]);

  return { locations, loading };
}

export function useTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tenantsApi.getAll().then((data) => {
      setTenants(data);
      setLoading(false);
    });
  }, []);

  return { tenants, loading };
}
