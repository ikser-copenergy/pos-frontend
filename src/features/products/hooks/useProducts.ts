import { useState, useEffect, useCallback } from "react";
import { productsApi } from "../api/productsApi";
import type { Product, CreateProductInput, UpdateProductInput } from "../types/product.types";

export function useProducts(tenantId?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productsApi.getAll(tenantId);
      setProducts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const create = useCallback(async (data: CreateProductInput) => {
    const created = await productsApi.create(data);
    setProducts((prev) => [...prev, created]);
    return created;
  }, []);

  const update = useCallback(async (id: string, data: UpdateProductInput) => {
    const updated = await productsApi.update(id, data);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? updated : p))
    );
    return updated;
  }, []);

  const archive = useCallback(async (id: string) => {
    const updated = await productsApi.archive(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    return updated;
  }, []);

  return { products, loading, error, refetch: fetchProducts, create, update, archive };
}
