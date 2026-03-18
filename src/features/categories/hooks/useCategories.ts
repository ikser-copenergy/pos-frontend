import { useState, useEffect, useCallback } from "react";
import { categoriesApi } from "../api/categoriesApi";
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../types/category.types";

export function useCategories(tenantId?: string) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoriesApi.getAll(tenantId);
      setCategories(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const create = useCallback(async (data: CreateCategoryInput) => {
    const created = await categoriesApi.create(data);
    setCategories((prev) => [...prev, created]);
    return created;
  }, []);

  const update = useCallback(async (id: string, data: UpdateCategoryInput) => {
    const updated = await categoriesApi.update(id, data);
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? updated : c))
    );
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await categoriesApi.delete(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    create,
    update,
    remove,
  };
}
