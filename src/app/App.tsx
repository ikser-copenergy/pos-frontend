import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/core/auth/AuthContext";
import { LoginPage } from "@/features/auth/ui/LoginPage";
import { RegisterPage } from "@/features/auth/ui/RegisterPage";
import { Sidebar } from "@/shared/ui/Sidebar";
import { AdminRoute } from "@/shared/ui/AdminRoute";
import { ProductsPage } from "@/features/products/ui/ProductsPage";
import { CategoriesPage } from "@/features/categories/ui/CategoriesPage";
import { InventoryPage } from "@/features/inventory/ui/InventoryPage";
import { SalesHistoryPage } from "@/features/sales/ui/SalesHistoryPage";
import { NewSalePage } from "@/features/sales/ui/NewSalePage";
import { CustomersPage } from "@/features/customers/ui/CustomersPage";
import { SettingsPage } from "@/features/settings/ui/SettingsPage";
import { UsersPage } from "@/features/users/ui/UsersPage";
import { ReportesPage } from "@/features/reportes/ui/ReportesPage";
import { ReporteDetallePage } from "@/features/reportes/ui/ReporteDetallePage";
import { TaxesPage } from "@/features/taxes/ui/TaxesPage";

function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="flex items-center gap-4 border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <Sidebar />
        {user?.tenantLogoUrl && (
          <img
            src={user.tenantLogoUrl}
            alt={user.tenantName}
            className="h-10 w-10 shrink-0 rounded object-cover"
          />
        )}
        <h1 className="text-xl font-semibold tracking-tight">
          {user?.tenantLogoUrl ? user.tenantName : "POS"}
        </h1>
        <div className="ml-auto flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.tenantName} &middot; {user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-100"
          >
            Salir
          </button>
        </div>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/productos" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/productos" replace /> : <RegisterPage />}
      />
      <Route
        path="/"
        element={user ? <AppLayout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Navigate to="/productos" replace />} />
        <Route path="productos" element={<ProductsPage />} />
        <Route path="categorias" element={<CategoriesPage />} />
        <Route path="impuestos" element={<TaxesPage />} />
        <Route path="clientes" element={<CustomersPage />} />
        <Route path="inventario" element={<InventoryPage />} />
        <Route path="ventas" element={<SalesHistoryPage />} />
        <Route path="ventas/nueva" element={<NewSalePage />} />
        <Route path="configuraciones" element={<SettingsPage />} />
        <Route element={<AdminRoute />}>
          <Route path="usuarios" element={<UsersPage />} />
          <Route path="reportes" element={<ReportesPage />} />
          <Route path="reportes/:reporteId" element={<ReporteDetallePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/productos" replace />} />
      </Route>
    </Routes>
  );
}
