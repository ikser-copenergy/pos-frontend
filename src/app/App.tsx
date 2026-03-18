import { Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "@/shared/ui/Sidebar";
import { ProductsPage } from "@/features/products/ui/ProductsPage";
import { CategoriesPage } from "@/features/categories/ui/CategoriesPage";
import { LocationsPage } from "@/features/locations/ui/LocationsPage";
import { InventoryPage } from "@/features/inventory/ui/InventoryPage";
import { SalesPage } from "@/features/sales/ui/SalesPage";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="flex items-center gap-4 border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <Sidebar />
        <h1 className="text-xl font-semibold tracking-tight">POS</h1>
      </header>
      <main className="p-6">
        <Routes>
          <Route path="/" element={<Navigate to="/productos" replace />} />
          <Route path="/productos" element={<ProductsPage />} />
          <Route path="/categorias" element={<CategoriesPage />} />
          <Route path="/ubicaciones" element={<LocationsPage />} />
          <Route path="/inventario" element={<InventoryPage />} />
          <Route path="/ventas" element={<SalesPage />} />
        </Routes>
      </main>
    </div>
  );
}
