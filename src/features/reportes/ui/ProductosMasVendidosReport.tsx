import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/core/auth/AuthContext";
import { useLocations } from "@/features/locations/hooks/useLocations";
import { reportsApi } from "../api/reportsApi";
import { SearchableSelect } from "@/shared/ui/SearchableSelect";
import type { TopProductRow } from "../api/reportsApi";

function defaultDateFromYmd() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function todayYmd() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function ProductosMasVendidosReport() {
  const { user } = useAuth();
  const tenantId = user?.tenantId;
  const { locations, loading: locationsLoading } = useLocations(tenantId);
  const [dateFrom, setDateFrom] = useState(defaultDateFromYmd);
  const [dateTo, setDateTo] = useState(todayYmd);
  const [locationId, setLocationId] = useState("");
  const [sort, setSort] = useState<"quantity" | "revenue">("quantity");
  const [limit, setLimit] = useState(50);
  const [rows, setRows] = useState<TopProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await reportsApi.getTopProducts({
        dateFrom,
        dateTo,
        locationId: locationId || undefined,
        limit,
        sort,
      });
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar el reporte");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, locationId, limit, sort]);

  useEffect(() => {
    if (!tenantId) return;
    void load();
    // Carga inicial; cambios de filtros con el botón "Aplicar filtros"
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-medium text-gray-800">Filtros</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div>
            <label className="mb-1 block text-xs text-gray-600">Desde</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-600">Hasta</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-gray-600">Sucursal (opcional)</label>
            <SearchableSelect
              options={[
                { value: "", label: "Todas las sucursales" },
                ...locations.map((l) => ({ value: l.id, label: l.name })),
              ]}
              value={locationId}
              onChange={setLocationId}
              placeholder={locationsLoading ? "Cargando…" : "Todas"}
              allowClear
              disabled={locationsLoading}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-600">Ordenar por</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "quantity" | "revenue")}
              className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm"
            >
              <option value="quantity">Cantidad vendida</option>
              <option value="revenue">Monto (L)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-600">Máx. filas</label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm"
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? "Cargando…" : "Aplicar filtros"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {loading && rows.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
          Cargando reporte…
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3 text-right">Cantidad</th>
                  <th className="px-4 py-3 text-right">Total (L)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No hay ventas en el rango y filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr key={r.productId} className="hover:bg-gray-50/80">
                      <td className="px-4 py-2.5 text-gray-500">{i + 1}</td>
                      <td className="px-4 py-2.5 font-medium text-gray-900">{r.productName}</td>
                      <td className="px-4 py-2.5 text-gray-600">{r.sku ?? "—"}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-gray-900">
                        {r.quantitySold.toLocaleString("es-HN", { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-gray-900">
                        L{r.revenue.toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
