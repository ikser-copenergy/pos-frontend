import { useParams, useNavigate } from "react-router-dom";
import { ProductosMasVendidosReport } from "./ProductosMasVendidosReport";
import { VencenProntoReport } from "./VencenProntoReport";
import { VentasPorUsuarioReport } from "./VentasPorUsuarioReport";

const reportTitles: Record<string, string> = {
  "productos-mas-vendidos": "Productos más vendidos",
  "vencen-pronto": "Vencen pronto",
  "ventas-por-usuario": "Ventas por usuario",
  "ingresos-vs-gastos": "Ingresos vs gastos",
};

export function ReporteDetallePage() {
  const { reporteId } = useParams<{ reporteId: string }>();
  const navigate = useNavigate();
  const title = reporteId ? reportTitles[reporteId] ?? "Reporte" : "Reporte";
  const isProductosVendidos = reporteId === "productos-mas-vendidos";
  const isVencenPronto = reporteId === "vencen-pronto";
  const isVentasPorUsuario = reporteId === "ventas-por-usuario";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/reportes")}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          ← Volver
        </button>
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>
      {isProductosVendidos ? (
        <ProductosMasVendidosReport />
      ) : isVencenPronto ? (
        <VencenProntoReport />
      ) : isVentasPorUsuario ? (
        <VentasPorUsuarioReport />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
          <p className="text-gray-500">Este reporte estará disponible próximamente.</p>
        </div>
      )}
    </div>
  );
}
