import { useState } from "react";
import { invoicesApi } from "../api/invoicesApi";
import type { Sale } from "../types/sale.types";
import type { Invoice } from "../types/invoice.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale;
  onInvoiceCreated: (saleId: string, invoice: Invoice) => void;
}

export function InvoiceModal({ isOpen, onClose, sale, onInvoiceCreated }: Props) {
  const [customerName, setCustomerName] = useState(sale.customer?.name ?? "");
  const [customerRTN, setCustomerRTN] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const invoice = await invoicesApi.create({
        tenantId: sale.tenantId,
        saleId: sale.id,
        total: sale.total,
        tax: sale.tax ?? undefined,
        customerName: customerName || undefined,
        customerRTN: customerRTN || undefined,
      });
      onInvoiceCreated(sale.id, invoice);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al generar factura");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-2xl">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Generar factura</h3>
            <p className="mt-1 text-sm text-gray-500">
              Venta del {new Date(sale.createdAt).toLocaleString()} &mdash; L{sale.total.toFixed(2)}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs font-medium uppercase text-gray-500">Detalle de la venta</p>
                <div className="mt-2 space-y-1">
                  {sale.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.product?.name ?? "Producto"} x{item.quantity}
                      </span>
                      <span className="font-medium text-gray-900">L{item.total.toFixed(2)}</span>
                    </div>
                  ))}
                  {(sale.discount ?? 0) > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Descuento</span>
                      <span>-L{(sale.discount ?? 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-200 pt-1 font-medium">
                    <span>Total</span>
                    <span>L{sale.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nombre del cliente
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Consumidor final"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  RTN (opcional)
                </label>
                <input
                  type="text"
                  value={customerRTN}
                  onChange={(e) => setCustomerRTN(e.target.value)}
                  placeholder="0000-0000-000000"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
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
                disabled={loading}
                className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {loading ? "Generando..." : "Generar factura"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
