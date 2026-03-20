import { useState } from "react";
import type { Sale } from "../types/sale.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale;
  onAddPayment: (method: "CASH" | "TRANSFER" | "CARD", amount: number) => Promise<void>;
}

export function AddPaymentModal({ isOpen, onClose, sale, onAddPayment }: Props) {
  const [method, setMethod] = useState<"CASH" | "TRANSFER" | "CARD">("CASH");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const paidTotal = sale.payments?.reduce((s, p) => s + p.amount, 0) ?? 0;
  const balance = sale.total - paidTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setError("Ingrese un monto válido");
      return;
    }
    if (amt > balance) {
      setError(`El monto no puede superar el saldo pendiente (L${balance.toFixed(2)})`);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onAddPayment(method, amt);
      onClose();
      setAmount("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al registrar pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white shadow-2xl">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Agregar pago</h3>
            <p className="mt-1 text-sm text-gray-500">
              Venta del {new Date(sale.createdAt).toLocaleString()}
            </p>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-gray-600">Total:</span>
              <span className="font-medium">L{sale.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pagado:</span>
              <span className="font-medium text-emerald-600">L{paidTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-700">Saldo pendiente:</span>
              <span className="text-amber-600">L{balance.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Monto</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={balance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Máx. L${balance.toFixed(2)}`}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Método</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as "CASH" | "TRANSFER" | "CARD")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="CASH">Efectivo</option>
                  <option value="CARD">Tarjeta</option>
                  <option value="TRANSFER">Transferencia</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !amount}
                className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {loading ? "Registrando..." : "Registrar pago"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
