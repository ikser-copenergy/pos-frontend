import { useState } from "react";
import { Modal } from "@/shared/ui/Modal";
import type { CreateInventoryInput } from "../types/inventory.types";

interface InventoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  products: { id: string; name: string }[];
  locations: { id: string; name: string }[];
  productsLoading: boolean;
  locationsLoading: boolean;
  onSubmit: (data: CreateInventoryInput) => Promise<void>;
}

export function InventoryFormModal({
  isOpen,
  onClose,
  tenantId,
  products,
  locations,
  productsLoading,
  locationsLoading,
  onSubmit,
}: InventoryFormModalProps) {
  const [productId, setProductId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!productId || !locationId) {
      setError("Producto y ubicación son requeridos");
      return;
    }
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty < 0) {
      setError("Cantidad debe ser un número válido");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        tenantId,
        productId,
        locationId,
        quantity: qty,
      });
      setProductId("");
      setLocationId("");
      setQuantity("0");
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setProductId("");
    setLocationId("");
    setQuantity("0");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nuevo registro de inventario">
      <form onSubmit={handleSubmit}>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-600">Producto</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
              disabled={productsLoading}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none disabled:opacity-50"
            >
              <option value="">Seleccionar...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Ubicación</label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              required
              disabled={locationsLoading}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none disabled:opacity-50"
            >
              <option value="">Seleccionar...</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Cantidad</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              step="0.01"
              min="0"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting || productsLoading || locationsLoading}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {submitting ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
