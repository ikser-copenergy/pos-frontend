import { useState, useEffect } from "react";
import { useCategories } from "../hooks/useCategories";
import { useTenants } from "@/features/inventory/hooks/useInventory";
import { CategoryFormModal } from "./CategoryFormModal";
import { IconEdit, IconTrash } from "@/shared/ui/icons";
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../types/category.types";

function getParentName(categories: Category[], parentId: string | null | undefined): string {
  if (!parentId) return "—";
  const parent = categories.find((c) => c.id === parentId);
  return parent?.name ?? "—";
}

export function CategoriesPage() {
  const [tenantId, setTenantId] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { tenants, loading: tenantsLoading } = useTenants();
  const { categories, loading, error, create, update, remove } = useCategories(
    tenantId || undefined
  );

  useEffect(() => {
    if (!tenantId && tenants[0]) setTenantId(tenants[0].id);
  }, [tenants, tenantId]);

  const selectedTenant = tenantId || tenants[0]?.id;

  const handleSubmit = async (
    data: CreateCategoryInput | (UpdateCategoryInput & { id: string })
  ) => {
    if ("id" in data) {
      const { id, ...rest } = data;
      await update(id, rest);
      setEditingCategory(null);
    } else {
      await create(data);
      setShowModal(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (confirm(`¿Eliminar la categoría "${cat.name}"?`)) {
      await remove(cat.id);
    }
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
          onClick={() => {
            setEditingCategory(null);
            setShowModal(true);
          }}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          + Nueva categoría
        </button>
      </div>

      <CategoryFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCategory(null);
        }}
        tenantId={selectedTenant}
        categories={categories}
        category={editingCategory}
        onSubmit={handleSubmit}
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
          Cargando categorías...
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
          No hay categorías. Crea una nueva.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Categoría padre
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {cat.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {getParentName(categories, cat.parentId)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setShowModal(true);
                        }}
                        className="rounded p-2 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600"
                        title="Editar"
                      >
                        <IconEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        className="rounded p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                        title="Eliminar"
                      >
                        <IconTrash />
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
