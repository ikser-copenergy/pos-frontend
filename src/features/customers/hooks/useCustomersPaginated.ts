import { useState, useEffect, useCallback } from "react";
import { customersApi } from "../api/customersApi";
import type {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
} from "../types/customer.types";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export function useCustomersPaginated(tenantId?: string, limit = DEFAULT_LIMIT) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCustomers = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await customersApi.getAllPaginated(tenantId, p, limit);
      setCustomers(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setPage(result.page);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  }, [tenantId, limit]);

  useEffect(() => {
    fetchCustomers(page);
  }, [fetchCustomers, page]);

  const goToPage = useCallback((p: number) => {
    setPage(Math.max(1, Math.min(p, totalPages || 1)));
  }, [totalPages]);

  const create = useCallback(async (data: CreateCustomerInput) => {
    const created = await customersApi.create(data);
    await fetchCustomers(page);
    return created;
  }, [fetchCustomers, page]);

  const update = useCallback(async (id: string, data: UpdateCustomerInput) => {
    const updated = await customersApi.update(id, data);
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? updated : c))
    );
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await customersApi.delete(id);
    const newTotal = total - 1;
    const newTotalPages = Math.ceil(newTotal / limit) || 1;
    const targetPage = page > newTotalPages ? Math.max(1, newTotalPages) : page;
    setPage(targetPage);
  }, [total, page, limit]);

  return {
    customers,
    loading,
    error,
    page,
    limit,
    total,
    totalPages,
    refetch: () => fetchCustomers(page),
    goToPage,
    create,
    update,
    remove,
  };
}
