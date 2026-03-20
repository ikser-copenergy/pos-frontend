import { useState } from "react";
import { useAuth } from "@/core/auth/AuthContext";
import { useCustomersPaginated } from "../hooks/useCustomersPaginated";
import { CustomerFormModal } from "./CustomerFormModal";
import { IconEdit, IconTrash } from "@/shared/ui/icons";
import { ConfirmModal } from "@/shared/ui/ConfirmModal";
import type {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
} from "../types/customer.types";

const PAGE_SIZE = 10;

export function CustomersPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId ?? "";
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  const {
    customers,
    loading,
    error,
    page,
    total,
    totalPages,
    goToPage,
    create,
    update,
    remove,
  } = useCustomersPaginated(tenantId || undefined, PAGE_SIZE);

  const handleSubmit = async (
    data: CreateCustomerInput | (UpdateCustomerInput & { id: string })
  ) => {
    if ("id" in data) {
      const { id, ...rest } = data;
      await update(id, rest);
      setEditingCustomer(null);
    } else {
      await create(data);
      setShowModal(false);
    }
  };

  const handleDeleteClick = (customer: Customer) => {
    setDeletingCustomer(customer);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCustomer) return;
    await remove(deletingCustomer.id);
    setDeletingCustomer(null);
  };

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Clientes</h2>
        <button
          onClick={() => {
            setEditingCustomer(null);
            setShowModal(true);
          }}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          + Nuevo cliente
        </button>
      </div>

      <CustomerFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCustomer(null);
        }}
        tenantId={tenantId}
        customer={editingCustomer}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        isOpen={!!deletingCustomer}
        onClose={() => setDeletingCustomer(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar cliente"
        message={
          deletingCustomer
            ? `¿Eliminar el cliente "${deletingCustomer.name}"?`
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
          Cargando clientes...
        </div>
      ) : customers.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
          No hay clientes. Crea uno nuevo.
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                    Teléfono
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                    Correo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                    Dirección
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600">
                    Deuda
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {customer.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {customer.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {customer.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {customer.address ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {(customer.debt ?? 0) > 0 ? (
                        <span className="font-medium text-amber-600">
                          L{(customer.debt ?? 0).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingCustomer(customer);
                            setShowModal(true);
                          }}
                          className="rounded p-2 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600"
                          title="Editar"
                        >
                          <IconEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(customer)}
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

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3">
              <p className="text-sm text-gray-600">
                Mostrando {from}–{to} de {total} clientes
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="px-2 text-sm text-gray-600">
                  Página {page} de {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
