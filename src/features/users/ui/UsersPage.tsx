import { useState } from "react";
import { useUsers } from "../hooks/useUsers";
import { UserFormModal } from "./UserFormModal";
import { IconEdit, IconTrash } from "@/shared/ui/icons";
import { ConfirmModal } from "@/shared/ui/ConfirmModal";
import type { User } from "../api/usersApi";
import type { CreateUserInput, UpdateUserInput } from "../api/usersApi";

const MAX_CASHIERS = 3;

export function UsersPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const { users, cashierCount, loading, error, create, update, remove } = useUsers();

  const canAddCashier = cashierCount < MAX_CASHIERS;

  const handleSubmit = async (
    data: CreateUserInput | (UpdateUserInput & { id: string })
  ) => {
    if ("id" in data) {
      const { id, ...rest } = data;
      await update(id, rest);
      setEditingUser(null);
    } else {
      await create(data);
      setShowModal(false);
    }
  };

  const handleDeleteClick = (u: User) => {
    if (u.role === "ADMIN") return;
    setDeletingUser(u);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    await remove(deletingUser.id);
    setDeletingUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Usuarios (Cajeros)</h2>
        {canAddCashier && (
          <button
            onClick={() => {
              setEditingUser(null);
              setShowModal(true);
            }}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            + Nuevo cajero
          </button>
        )}
      </div>

      {!canAddCashier && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          Máximo {MAX_CASHIERS} cajeros permitidos. Elimina uno para agregar otro.
        </div>
      )}

      <UserFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar cajero"
        message={
          deletingUser
            ? `¿Eliminar al cajero "${deletingUser.name}"?`
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
          Cargando usuarios...
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
          No hay usuarios.
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
                  Correo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Rol
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-gray-600">{u.role}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {u.role === "CASHIER" && (
                        <>
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setShowModal(true);
                            }}
                            className="rounded p-2 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600"
                            title="Editar"
                          >
                            <IconEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(u)}
                            className="rounded p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                            title="Eliminar"
                          >
                            <IconTrash />
                          </button>
                        </>
                      )}
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
