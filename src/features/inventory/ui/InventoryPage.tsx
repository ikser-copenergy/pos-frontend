import { useState } from "react";
import { useAuth } from "@/core/auth/AuthContext";
import { useInventory, useProducts, useLocations } from "../hooks/useInventory";
import { InventoryTable } from "./InventoryTable";
import { InventoryFormModal } from "./InventoryFormModal";
import { EditInventoryModal } from "./EditInventoryModal";
import { ConfirmModal } from "@/shared/ui/ConfirmModal";
import type { CreateInventoryInput, InventoryItem } from "../types/inventory.types";

export function InventoryPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId ?? "";
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);

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

  const handleDeleteClick = (item: InventoryItem) => {
    setDeletingItem(item);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    await remove(deletingItem.id);
    setDeletingItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Inventario</h2>
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
        tenantId={tenantId}
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

      <ConfirmModal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar registro de inventario"
        message={
          deletingItem
            ? `¿Eliminar el registro de ${deletingItem.product.name} en ${deletingItem.location.name}?`
            : ""
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
      />

      <InventoryTable
        items={items}
        loading={loading}
        onEdit={setEditingItem}
        onDelete={handleDeleteClick}
      />
    </div>
  );
}
