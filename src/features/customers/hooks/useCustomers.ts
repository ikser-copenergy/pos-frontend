import { useState, useEffect, useCallback } from "react";
import { customersApi } from "../api/customersApi";
import type {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
} from "../types/customer.types";

export function useCustomers(tenantId?: string) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customersApi.getAll(tenantId);
      setCustomers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const create = useCallback(async (data: CreateCustomerInput) => {
    const created = await customersApi.create(data);
    setCustomers((prev) => [...prev, created]);
    return created;
  }, []);

  const update = useCallback(async (id: string, data: UpdateCustomerInput) => {
    const updated = await customersApi.update(id, data);
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? updated : c))
    );
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await customersApi.delete(id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return {
    customers,
    loading,
    error,
    refetch: fetchCustomers,
    create,
    update,
    remove,
  };
}
