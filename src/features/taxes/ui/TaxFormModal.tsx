import { useEffect, useState } from "react";
import { Modal } from "@/shared/ui/Modal";
import type { CreateTaxInput, Tax, UpdateTaxInput } from "../types/tax.types";

interface TaxFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  tax?: Tax | null;
  onSubmit: (data: CreateTaxInput | (UpdateTaxInput & { id: string })) => Promise<void>;
}

export function TaxFormModal({
  isOpen,
  onClose,
  tenantId,
  tax,
  onSubmit,
}: TaxFormModalProps) {
  const isEdit = !!tax;
  const [name, setName] = useState("");
  const [rate, setRate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tax) {
      setName(tax.name);
      setRate(String(tax.rate));
    } else {
      setName("");
      setRate("");
    }
  }, [tax, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("El nombre es requerido");
      return;
    }
    if (rate === "") {
      setError("El porcentaje es requerido");
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit && tax) {
        await onSubmit({
          id: tax.id,
          name: name.trim(),
          rate: Number(rate),
        });
      } else {
        await onSubmit({
          tenantId,
          name: name.trim(),
          rate: Number(rate),
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
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Editar impuesto" : "Nuevo impuesto"}>
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
            <label className="mb-1 block text-sm text-gray-600">Porcentaje (%) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              required
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
