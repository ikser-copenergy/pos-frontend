import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/core/auth/AuthContext";
import { LoginPage } from "@/features/auth/ui/LoginPage";
import { Sidebar } from "@/shared/ui/Sidebar";
import { ProductsPage } from "@/features/products/ui/ProductsPage";
import { CategoriesPage } from "@/features/categories/ui/CategoriesPage";
import { LocationsPage } from "@/features/locations/ui/LocationsPage";
import { InventoryPage } from "@/features/inventory/ui/InventoryPage";
import { SalesPage } from "@/features/sales/ui/SalesPage";

function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="flex items-center gap-4 border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <Sidebar />
        <h1 className="text-xl font-semibold tracking-tight">POS</h1>
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
        <Routes>
          <Route path="/" element={<Navigate to="/productos" replace />} />
          <Route path="/productos" element={<ProductsPage />} />
          <Route path="/categorias" element={<CategoriesPage />} />
          <Route path="/ubicaciones" element={<LocationsPage />} />
          <Route path="/inventario" element={<InventoryPage />} />
          <Route path="/ventas" element={<SalesPage />} />
          <Route path="*" element={<Navigate to="/productos" replace />} />
        </Routes>
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
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/*"
        element={user ? <AppLayout /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}
