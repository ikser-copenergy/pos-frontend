import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/core/auth/AuthContext";
import { useLocations } from "@/features/locations/hooks/useLocations";
import { reportsApi } from "../api/reportsApi";
import { SearchableSelect } from "@/shared/ui/SearchableSelect";
import type { ExpiringSoonRow } from "../api/reportsApi";

function formatShortDate(iso: string) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("es-HN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function VencenProntoReport() {
  const { user } = useAuth();
  const tenantId = user?.tenantId;
  const { locations, loading: locationsLoading } = useLocations(tenantId);
  const [days, setDays] = useState(7);
  const [locationId, setLocationId] = useState("");
  const [includeExpired, setIncludeExpired] = useState(true);
  const [limit, setLimit] = useState(200);
  const [rows, setRows] = useState<ExpiringSoonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await reportsApi.getExpiringSoon({
        days,
        locationId: locationId || undefined,
        includeExpired,
        limit,
      });
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar el reporte");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [days, locationId, includeExpired, limit]);

  useEffect(() => {
    if (!tenantId) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-medium text-gray-800">Filtros</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <div>
            <label className="mb-1 block text-xs text-gray-600">Días a futuro</label>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm"
            >
              <option value={7}>7 días</option>
              <option value={14}>14 días</option>
              <option value={30}>30 días</option>
              <option value={60}>60 días</option>
              <option value={90}>90 días</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Productos cuya fecha de vencimiento cae en este rango a partir de hoy.
            </p>
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
            <label className="mb-1 block text-xs text-gray-600">Máx. filas</label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={500}>500</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={includeExpired}
                onChange={(e) => setIncludeExpired(e.target.checked)}
                className="rounded border-gray-300"
              />
              Incluir ya vencidos (con existencias)
            </label>
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
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Sucursal</th>
                  <th className="px-4 py-3 text-right">Cantidad</th>
                  <th className="px-4 py-3">Vence</th>
                  <th className="px-4 py-3 text-right">Días</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No hay productos con vencimiento en el rango seleccionado (con stock en almacén).
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr key={`${r.productId}-${r.locationId}`} className="hover:bg-gray-50/80">
                      <td className="px-4 py-2.5 text-gray-500">{i + 1}</td>
                      <td className="px-4 py-2.5 font-medium text-gray-900">{r.productName}</td>
                      <td className="px-4 py-2.5 text-gray-600">{r.sku ?? "—"}</td>
                      <td className="px-4 py-2.5 text-gray-700">{r.locationName}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-gray-900">
                        {r.quantity.toLocaleString("es-HN", { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2.5 text-gray-800">{formatShortDate(r.expiresAt)}</td>
                      <td
                        className={`px-4 py-2.5 text-right tabular-nums ${
                          r.daysLeft < 0 ? "font-medium text-red-700" : "text-gray-900"
                        }`}
                      >
                        {r.daysLeft < 0 ? `Vencido (${r.daysLeft})` : r.daysLeft}
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
