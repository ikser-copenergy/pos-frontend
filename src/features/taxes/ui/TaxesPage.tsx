import { useState } from "react";
import { useAuth } from "@/core/auth/AuthContext";
import { ConfirmModal } from "@/shared/ui/ConfirmModal";
import { IconEdit, IconTrash } from "@/shared/ui/icons";
import { useTaxes } from "../hooks/useTaxes";
import { TaxFormModal } from "./TaxFormModal";
import type { CreateTaxInput, Tax, UpdateTaxInput } from "../types/tax.types";

export function TaxesPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId ?? "";
  const [showModal, setShowModal] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [deletingTax, setDeletingTax] = useState<Tax | null>(null);

  const { taxes, loading, error, create, update, remove } = useTaxes(tenantId || undefined);

  const handleSubmit = async (data: CreateTaxInput | (UpdateTaxInput & { id: string })) => {
    if ("id" in data) {
      const { id, ...rest } = data;
      await update(id, rest);
      setEditingTax(null);
    } else {
      await create(data);
      setShowModal(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTax) return;
    await remove(deletingTax.id);
    setDeletingTax(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Impuestos</h2>
        <button
          onClick={() => {
            setEditingTax(null);
            setShowModal(true);
          }}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          + Nuevo impuesto
        </button>
      </div>

      <TaxFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTax(null);
        }}
        tenantId={tenantId}
        tax={editingTax}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        isOpen={!!deletingTax}
        onClose={() => setDeletingTax(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar impuesto"
        message={deletingTax ? `¿Eliminar el impuesto "${deletingTax.name}"?` : ""}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
          Cargando impuestos...
        </div>
      ) : taxes.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
          No hay impuestos. Crea uno nuevo.
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
                  Porcentaje
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {taxes.map((tax) => (
                <tr key={tax.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{tax.name}</td>
                  <td className="px-4 py-3 text-gray-700">{tax.rate.toFixed(2)}%</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditingTax(tax);
                          setShowModal(true);
                        }}
                        className="rounded p-2 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600"
                        title="Editar"
                      >
                        <IconEdit />
                      </button>
                      <button
                        onClick={() => setDeletingTax(tax)}
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
