import { useState, useEffect } from "react";
import { Modal } from "@/shared/ui/Modal";
import type {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
} from "../types/customer.types";

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  customer?: Customer | null;
  onSubmit: (
    data: CreateCustomerInput | (UpdateCustomerInput & { id: string })
  ) => Promise<void>;
}

export function CustomerFormModal({
  isOpen,
  onClose,
  tenantId,
  customer,
  onSubmit,
}: CustomerFormModalProps) {
  const isEdit = !!customer;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone ?? "");
      setEmail(customer.email ?? "");
      setAddress(customer.address ?? "");
    } else {
      setName("");
      setPhone("");
      setEmail("");
      setAddress("");
    }
  }, [customer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("El nombre es requerido");
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit && customer) {
        await onSubmit({
          id: customer.id,
          name: name.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          address: address.trim() || null,
        });
      } else {
        await onSubmit({
          tenantId,
          name: name.trim(),
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          address: address.trim() || undefined,
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
      title={isEdit ? "Editar cliente" : "Nuevo cliente"}
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
            <label className="mb-1 block text-sm text-gray-600">Teléfono</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Dirección</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
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
