import { useParams, useNavigate } from "react-router-dom";

const reportTitles: Record<string, string> = {
  "productos-mas-vendidos": "Productos más vendidos",
  "vencen-pronto": "Vencen pronto",
  "ventas-por-periodo": "Ventas por período",
  "ingresos-vs-gastos": "Ingresos vs gastos",
};

export function ReporteDetallePage() {
  const { reporteId } = useParams<{ reporteId: string }>();
  const navigate = useNavigate();
  const title = reporteId ? reportTitles[reporteId] ?? "Reporte" : "Reporte";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/reportes")}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          ← Volver
        </button>
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
        <p className="text-gray-500">Este reporte estará disponible próximamente.</p>
      </div>
    </div>
  );
}
