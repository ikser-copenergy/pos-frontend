import { useState, useEffect } from "react";
import { Modal } from "@/shared/ui/Modal";
import { SearchableSelect } from "@/shared/ui/SearchableSelect";
import { useLocations } from "@/features/inventory/hooks/useInventory";
import type { User } from "../api/usersApi";
import type { CreateUserInput, UpdateUserInput } from "../api/usersApi";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  user?: User | null;
  onSubmit: (data: CreateUserInput | (UpdateUserInput & { id: string })) => Promise<void>;
}

export function UserFormModal({
  isOpen,
  onClose,
  tenantId,
  user,
  onSubmit,
}: UserFormModalProps) {
  const isEdit = !!user;
  const { locations } = useLocations(tenantId || undefined);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [defaultLocationId, setDefaultLocationId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPassword("");
      setPhone(user.phone ?? "");
      setDefaultLocationId(user.defaultLocationId ?? "");
    } else {
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setDefaultLocationId("");
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (user || !isOpen || !locations.length) return;
    setDefaultLocationId((prev) => (prev ? prev : locations[0].id));
  }, [user, isOpen, locations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("El nombre es requerido");
      return;
    }
    if (!email.trim()) {
      setError("El correo es requerido");
      return;
    }
    if (!isEdit && !password) {
      setError("La contraseña es requerida");
      return;
    }
    if (!defaultLocationId) {
      setError("Selecciona la tienda por defecto");
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit && user) {
        await onSubmit({
          id: user.id,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          defaultLocationId,
          ...(password ? { password } : {}),
        });
      } else {
        await onSubmit({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
          defaultLocationId,
        });
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Editar cajero" : "Nuevo cajero"}
    >
      <form onSubmit={handleSubmit}>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-600">Nombre *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Correo *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isEdit}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
            />
            {isEdit && (
              <p className="mt-1 text-xs text-gray-500">El correo no se puede modificar</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">
              Contraseña {isEdit ? "(dejar vacío para no cambiar)" : "*"}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isEdit}
              minLength={6}
              placeholder={isEdit ? "••••••••" : ""}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Teléfono</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Tienda por defecto *</label>
            {locations.length === 0 ? (
              <p className="text-sm text-amber-700">
                No hay ubicaciones. Crea una en Configuraciones.
              </p>
            ) : (
              <SearchableSelect
                options={locations.map((l) => ({ value: l.id, label: l.name }))}
                value={defaultLocationId}
                onChange={setDefaultLocationId}
                placeholder="Seleccionar tienda..."
                allowClear={false}
              />
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {submitting ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
