import { useState, useEffect } from "react";
import { Modal } from "@/shared/ui/Modal";
import type { User } from "../api/usersApi";
import type { CreateUserInput, UpdateUserInput } from "../api/usersApi";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onSubmit: (data: CreateUserInput | (UpdateUserInput & { id: string })) => Promise<void>;
}

export function UserFormModal({
  isOpen,
  onClose,
  user,
  onSubmit,
}: UserFormModalProps) {
  const isEdit = !!user;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPassword("");
      setPhone(user.phone ?? "");
    } else {
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
    }
  }, [user, isOpen]);

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
    setSubmitting(true);
    try {
      if (isEdit && user) {
        await onSubmit({
          id: user.id,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          ...(password ? { password } : {}),
        });
      } else {
        await onSubmit({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
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
