import { useState, useEffect } from "react";
import { useProducts } from "../hooks/useProducts";
import { useTenants, useLocations } from "@/features/inventory/hooks/useInventory";
import { categoriesApi } from "../api/categoriesApi";
import { productsApi } from "../api/productsApi";
import { ProductFormModal } from "./ProductFormModal";
import { IconArchive, IconEdit } from "@/shared/ui/icons";
import type { CreateProductInput, UpdateProductInput, Product } from "../types/product.types";

export function ProductsPage() {
  const [tenantId, setTenantId] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const { tenants, loading: tenantsLoading } = useTenants();
  const { locations } = useLocations(tenantId || undefined);
  const { products, loading, error, create, update, archive } = useProducts(
    tenantId || undefined
  );

  useEffect(() => {
    if (!tenantId && tenants[0]) setTenantId(tenants[0].id);
  }, [tenants, tenantId]);

  useEffect(() => {
    if (tenantId) {
      categoriesApi.getAll(tenantId).then((data) =>
        setCategories(data.map((c) => ({ id: c.id, name: c.name })))
      );
    }
  }, [tenantId]);

  const selectedTenant = tenantId || tenants[0]?.id;

  const handleSubmit = async (
    data: CreateProductInput | (UpdateProductInput & { id: string })
  ) => {
    if ("id" in data) {
      const { id, ...rest } = data;
      await update(id, rest);
      setEditingProduct(null);
    } else {
      await create(data);
      setShowModal(false);
    }
  };

  const openCreate = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const openEdit = async (product: Product) => {
    const fullProduct = await productsApi.getById(product.id);
    setEditingProduct(fullProduct);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleArchive = async (product: Product) => {
    if (!confirm(`¿Archivar el producto "${product.name}"? No se mostrará en la lista activa.`)) return;
    await archive(product.id);
  };

  if (tenantsLoading && tenants.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (tenants.length === 0) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800">
        <p className="font-medium">No hay tenants configurados</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Tenant:</label>
          <select
            value={selectedTenant}
            onChange={(e) => setTenantId(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          + Nuevo producto
        </button>
      </div>

      <ProductFormModal
        isOpen={showModal}
        onClose={closeModal}
        tenantId={selectedTenant}
        categories={categories}
        locations={locations}
        product={editingProduct}
        onSubmit={handleSubmit}
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
          Cargando productos...
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
          No hay productos. Crea uno nuevo.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Imagen
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  SKU
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Precio
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0].url}
                        alt={p.name}
                        className="h-12 w-12 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100 text-gray-400">
                        —
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.sku ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-900">
                    {p.salePrice != null ? p.salePrice : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="rounded p-2 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600"
                        title="Editar"
                      >
                        <IconEdit />
                      </button>
                      <button
                        onClick={() => handleArchive(p)}
                        className="rounded p-2 text-gray-500 hover:bg-amber-50 hover:text-amber-600"
                        title="Archivar"
                      >
                        <IconArchive />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
