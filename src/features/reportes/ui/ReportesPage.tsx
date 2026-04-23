import { useNavigate } from "react-router-dom";
import { IconChartBar, IconClock, IconCurrency, IconTrendingUp } from "@/shared/ui/icons";

const reportButtons = [
  {
    id: "productos-mas-vendidos",
    label: "Productos más vendidos",
    icon: IconChartBar,
    path: "/reportes/productos-mas-vendidos",
  },
  {
    id: "vencen-pronto",
    label: "Vencen pronto",
    icon: IconClock,
    path: "/reportes/vencen-pronto",
  },
  {
    id: "ventas-por-periodo",
    label: "Ventas por período",
    icon: IconTrendingUp,
    path: "/reportes/ventas-por-periodo",
  },
  {
    id: "ingresos-vs-gastos",
    label: "Ingresos vs gastos",
    icon: IconCurrency,
    path: "/reportes/ingresos-vs-gastos",
  },
];

export function ReportesPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Reportes</h2>
      <p className="text-gray-600">
        Selecciona un reporte para ver los detalles.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reportButtons.map(({ id, label, icon: Icon, path }) => (
          <button
            key={id}
            onClick={() => navigate(path)}
            className="flex min-h-[120px] touch-manipulation flex-col items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white p-6 text-gray-900 shadow-sm transition-all active:scale-[0.98] hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <div className="rounded-full bg-emerald-100 p-4">
              <Icon className="h-10 w-10 text-emerald-600" />
            </div>
            <span className="text-center text-base font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
