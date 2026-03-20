import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/core/auth/AuthContext";
import { useSales } from "../hooks/useSales";
import { InvoiceModal } from "./InvoiceModal";
import { AddPaymentModal } from "./AddPaymentModal";
import type { Sale } from "../types/sale.types";
import type { Invoice } from "../types/invoice.types";

export function SalesHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const tenantId = user?.tenantId ?? "";
  const { sales, loading, updateSaleInvoice, addPayment } = useSales(tenantId || undefined);
  const [invoiceSale, setInvoiceSale] = useState<Sale | null>(null);
  const [paymentSale, setPaymentSale] = useState<Sale | null>(null);

  const handleInvoiceCreated = (saleId: string, invoice: Invoice) => {
    updateSaleInvoice(saleId, {
      id: invoice.id,
      number: invoice.number,
      customerName: invoice.customerName,
      customerRTN: invoice.customerRTN,
      total: invoice.total,
      tax: invoice.tax,
      createdAt: invoice.createdAt,
    });
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Ventas</h2>
        <button
          type="button"
          onClick={() => navigate("/ventas/nueva")}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          + Nueva venta
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <h3 className="border-b border-gray-200 px-4 py-3 font-medium text-gray-900">Ventas recientes</h3>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando ventas...</div>
        ) : sales.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="mb-4">No hay ventas registradas</p>
            <button
              type="button"
              onClick={() => navigate("/ventas/nueva")}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              Crear primera venta
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">Ubicación</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">Cliente</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600">Total</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600">Pagado</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600">Saldo</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sales.slice(0, 10).map((sale) => {
                  const paid = sale.payments?.reduce((s, p) => s + p.amount, 0) ?? 0;
                  const balance = sale.total - paid;
                  return (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(sale.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{sale.location?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{sale.customer?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        L{sale.total.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-emerald-600">
                        L{paid.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        {balance <= 0 ? (
                          <span className="text-gray-500">—</span>
                        ) : (
                          <span className="font-medium text-amber-600">L{balance.toFixed(2)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          {balance > 0 && (
                            <button
                              type="button"
                              onClick={() => setPaymentSale(sale)}
                              className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100"
                            >
                              Cobrar
                            </button>
                          )}
                          {sale.invoice ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                              {sale.invoice.number}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setInvoiceSale(sale)}
                              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100"
                            >
                              Facturar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {invoiceSale && (
        <InvoiceModal
          isOpen={!!invoiceSale}
          onClose={() => setInvoiceSale(null)}
          sale={invoiceSale}
          onInvoiceCreated={handleInvoiceCreated}
        />
      )}

      {paymentSale && (
        <AddPaymentModal
          isOpen={!!paymentSale}
          onClose={() => setPaymentSale(null)}
          sale={paymentSale}
          onAddPayment={async (method, amount) => {
            await addPayment(paymentSale.id, { method, amount });
          }}
        />
      )}
    </div>
  );
}
