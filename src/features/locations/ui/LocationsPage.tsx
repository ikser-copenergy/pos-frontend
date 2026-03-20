import { useState } from "react";
import { useAuth } from "@/core/auth/AuthContext";
import { useLocations } from "../hooks/useLocations";
import { LocationFormModal } from "./LocationFormModal";
import { IconEdit, IconTrash } from "@/shared/ui/icons";
import { ConfirmModal } from "@/shared/ui/ConfirmModal";
import type {
  Location,
  CreateLocationInput,
  UpdateLocationInput,
} from "../types/location.types";

export function LocationsPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId ?? "";
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [deletingLocation, setDeletingLocation] = useState<Location | null>(null);

  const { locations, loading, error, create, update, remove } = useLocations(
    tenantId || undefined
  );

  const handleSubmit = async (
    data: CreateLocationInput | (UpdateLocationInput & { id: string })
  ) => {
    if ("id" in data) {
      const { id, ...rest } = data;
      await update(id, rest);
      setEditingLocation(null);
    } else {
      await create(data);
      setShowModal(false);
    }
  };

  const handleDeleteClick = (loc: Location) => {
    setDeletingLocation(loc);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingLocation) return;
    await remove(deletingLocation.id);
    setDeletingLocation(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Ubicaciones</h2>
        <button
          onClick={() => {
            setEditingLocation(null);
            setShowModal(true);
          }}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          + Nueva ubicación
        </button>
      </div>

      <LocationFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingLocation(null);
        }}
        tenantId={tenantId}
        location={editingLocation}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        isOpen={!!deletingLocation}
        onClose={() => setDeletingLocation(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar ubicación"
        message={
          deletingLocation
            ? `¿Eliminar la ubicación "${deletingLocation.name}"?`
            : ""
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
          Cargando ubicaciones...
        </div>
      ) : locations.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
          No hay ubicaciones. Crea una nueva.
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
                  Dirección
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {locations.map((loc) => (
                <tr key={loc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {loc.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {loc.address ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditingLocation(loc);
                          setShowModal(true);
                        }}
                        className="rounded p-2 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600"
                        title="Editar"
                      >
                        <IconEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(loc)}
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
