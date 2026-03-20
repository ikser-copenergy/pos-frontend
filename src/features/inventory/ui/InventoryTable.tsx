import { IconEdit, IconTrash } from "@/shared/ui/icons";
import type { InventoryItem } from "../types/inventory.types";

interface InventoryTableProps {
  items: InventoryItem[];
  loading: boolean;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

export function InventoryTable({
  items,
  loading,
  onEdit,
  onDelete,
}: InventoryTableProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
        Cargando inventario...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
        No hay registros de inventario. Crea uno nuevo.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
              Producto
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
              Variante
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
              Ubicación
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
              Cantidad
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-900">{item.product.name}</td>
              <td className="px-4 py-3 text-gray-600">
                {item.variant?.name ?? "—"}
              </td>
              <td className="px-4 py-3 text-gray-900">{item.location.name}</td>
              <td className="px-4 py-3 text-gray-900">{item.quantity}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <button
                    onClick={() => onEdit(item)}
                    className="rounded p-2 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600"
                    title="Editar"
                  >
                    <IconEdit />
                  </button>
                  <button
                    onClick={() => onDelete(item)}
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
  );
}
