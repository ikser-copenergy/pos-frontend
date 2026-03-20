import { useState, useEffect } from "react";
import { useAuth } from "@/core/auth/AuthContext";
import { useProducts } from "../hooks/useProducts";
import { useLocations } from "@/features/inventory/hooks/useInventory";
import { categoriesApi } from "../api/categoriesApi";
import { productsApi } from "../api/productsApi";
import { ProductFormModal } from "./ProductFormModal";
import { IconArchive, IconEdit } from "@/shared/ui/icons";
import { ConfirmModal } from "@/shared/ui/ConfirmModal";
import type { CreateProductInput, UpdateProductInput, Product } from "../types/product.types";

export function ProductsPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId ?? "";
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [archivingProduct, setArchivingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const { locations } = useLocations(tenantId || undefined);
  const { products, loading, error, create, update, archive } = useProducts(
    tenantId || undefined
  );

  useEffect(() => {
    if (tenantId) {
      categoriesApi.getAll(tenantId).then((data) =>
        setCategories(data.map((c) => ({ id: c.id, name: c.name })))
      );
    }
  }, [tenantId]);

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

  const handleArchiveClick = (product: Product) => {
    setArchivingProduct(product);
  };

  const handleArchiveConfirm = async () => {
    if (!archivingProduct) return;
    await archive(archivingProduct.id);
    setArchivingProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Productos</h2>
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
        tenantId={tenantId}
        categories={categories}
        locations={locations}
        product={editingProduct}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        isOpen={!!archivingProduct}
        onClose={() => setArchivingProduct(null)}
        onConfirm={handleArchiveConfirm}
        title="Archivar producto"
        message={
          archivingProduct
            ? `¿Archivar el producto "${archivingProduct.name}"? No se mostrará en la lista activa.`
            : ""
        }
        confirmLabel="Archivar"
        cancelLabel="Cancelar"
        variant="default"
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
                        onClick={() => handleArchiveClick(p)}
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
