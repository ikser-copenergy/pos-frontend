import { useState, useEffect, useCallback } from "react";
import { salesApi } from "../api/salesApi";
import type { Sale, CreateSaleInput, SaleInvoice } from "../types/sale.types";

export function useSales(tenantId?: string) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await salesApi.getAll(tenantId);
      setSales(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar ventas");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const create = useCallback(async (data: CreateSaleInput): Promise<Sale> => {
    const created = await salesApi.create(data);
    setSales((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateSaleInvoice = useCallback((saleId: string, invoice: SaleInvoice) => {
    setSales((prev) =>
      prev.map((s) => (s.id === saleId ? { ...s, invoice } : s))
    );
  }, []);

  return { sales, loading, error, refetch: fetchSales, create, updateSaleInvoice };
}
