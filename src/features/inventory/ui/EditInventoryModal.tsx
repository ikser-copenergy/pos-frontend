import { useState } from "react";
import { Modal } from "@/shared/ui/Modal";

interface EditInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  locationName: string;
  currentQuantity: number;
  onSave: (quantity: number) => Promise<void>;
}

export function EditInventoryModal({
  isOpen,
  onClose,
  productName,
  locationName,
  currentQuantity,
  onSave,
}: EditInventoryModalProps) {
  const [quantity, setQuantity] = useState(String(currentQuantity));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty < 0) {
      setError("Cantidad debe ser un número válido");
      return;
    }
    setSubmitting(true);
    try {
      await onSave(qty);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar cantidad">
      <form onSubmit={handleSubmit}>
        <p className="mb-2 text-sm text-gray-600">
          {productName} · {locationName}
        </p>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <div>
          <label className="mb-1 block text-sm text-gray-600">Cantidad</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            step="0.01"
            min="0"
            autoFocus
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none"
          />
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
