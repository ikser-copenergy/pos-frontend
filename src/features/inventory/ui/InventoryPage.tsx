import { useState, useEffect } from "react";
import { useInventory, useProducts, useLocations, useTenants } from "../hooks/useInventory";
import { InventoryTable } from "./InventoryTable";
import { InventoryFormModal } from "./InventoryFormModal";
import { EditInventoryModal } from "./EditInventoryModal";
import type { CreateInventoryInput, InventoryItem } from "../types/inventory.types";

export function InventoryPage() {
  const [tenantId, setTenantId] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const { tenants, loading: tenantsLoading } = useTenants();
  const { items, loading, error, create, update, remove } =
    useInventory(tenantId || undefined);
  const { products, loading: productsLoading } = useProducts(
    tenantId || undefined
  );
  const { locations, loading: locationsLoading } = useLocations(
    tenantId || undefined
  );

  const handleCreate = async (data: CreateInventoryInput) => {
    await create(data);
    setShowCreateModal(false);
  };

  const handleEditSave = async (quantity: number) => {
    if (!editingItem) return;
    await update(editingItem.id, { quantity });
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar este registro de inventario?")) {
      await remove(id);
    }
  };

  useEffect(() => {
    if (!tenantId && tenants[0]) setTenantId(tenants[0].id);
  }, [tenants, tenantId]);

  const selectedTenant = tenantId || tenants[0]?.id;

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
        <p className="mt-1 text-sm text-amber-700">
          Crea un tenant en el backend antes de usar el inventario.
        </p>
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
          onClick={() => setShowCreateModal(true)}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          + Nuevo registro
        </button>
      </div>

      <InventoryFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        tenantId={selectedTenant}
        products={products}
        locations={locations}
        productsLoading={productsLoading}
        locationsLoading={locationsLoading}
        onSubmit={handleCreate}
      />

      {editingItem && (
        <EditInventoryModal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          productName={editingItem.product.name}
          locationName={editingItem.location.name}
          currentQuantity={editingItem.quantity}
          onSave={handleEditSave}
        />
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <InventoryTable
        items={items}
        loading={loading}
        onEdit={setEditingItem}
        onDelete={handleDelete}
      />
    </div>
  );
}
