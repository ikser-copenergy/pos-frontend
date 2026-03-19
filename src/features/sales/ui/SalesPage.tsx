import { useState, useEffect } from "react";
import { useAuth } from "@/core/auth/AuthContext";
import { useLocations } from "@/features/inventory/hooks/useInventory";
import { productsApi } from "@/features/products/api/productsApi";
import { customersApi } from "../api/customersApi";
import { SearchableSelect } from "@/shared/ui/SearchableSelect";
import { useSales } from "../hooks/useSales";
import { InvoiceModal } from "./InvoiceModal";
import type { Product } from "@/features/products/types/product.types";
import type { Customer } from "../api/customersApi";
import type { Sale } from "../types/sale.types";
import type { Invoice } from "../types/invoice.types";

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export function SalesPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId ?? "";
  const [locationId, setLocationId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [discount, setDiscount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER" | "CARD">("CASH");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoiceSale, setInvoiceSale] = useState<Sale | null>(null);

  const { locations } = useLocations(tenantId || undefined);
  const { sales, loading: salesLoading, create, updateSaleInvoice } = useSales(tenantId || undefined);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    if (tenantId) {
      productsApi.getAll(tenantId).then(setProducts);
      customersApi.getAll(tenantId).then(setCustomers);
    }
  }, [tenantId]);

  useEffect(() => {
    if (locations.length && !locationId) setLocationId(locations[0].id);
  }, [locations, locationId]);

  const activeProducts = products.filter((p) => !p.archived);
  const productOptions = [
    { value: "", label: "Seleccionar producto..." },
    ...activeProducts.map((p) => ({
      value: p.id,
      label: `${p.name}${p.salePrice != null ? ` - L${p.salePrice}` : ""}`,
    })),
  ];

  const addToCart = () => {
    if (!selectedProductId || !quantity || parseFloat(quantity) <= 0) return;
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;
    const price = product.salePrice ?? 0;
    const qty = parseFloat(quantity);
    const total = price * qty;
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === selectedProductId);
      if (existing) {
        return prev.map((i) =>
          i.productId === selectedProductId
            ? {
                ...i,
                quantity: i.quantity + qty,
                total: (i.quantity + qty) * i.unitPrice,
              }
            : i
        );
      }
      return [...prev, { productId: product.id, productName: product.name, quantity: qty, unitPrice: price, total }];
    });
    setSelectedProductId("");
    setQuantity("1");
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const subtotal = cart.reduce((s, i) => s + i.total, 0);
  const discountVal = parseFloat(discount) || 0;
  const total = Math.max(0, subtotal - discountVal);

  const canSubmit =
    tenantId &&
    locationId &&
    user &&
    cart.length > 0 &&
    total > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      const newSale = await create({
        tenantId,
        locationId,
        userId: user!.id,
        customerId: customerId || undefined,
        total,
        discount: discountVal || undefined,
        items: cart.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          total: i.total,
        })),
        payments: [{ method: paymentMethod, amount: total }],
      });
      setCart([]);
      setDiscount("0");
      setInvoiceSale(newSale);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al registrar venta");
    } finally {
      setSubmitting(false);
    }
  };

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
        <h2 className="text-xl font-semibold text-gray-900">Nueva venta</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{user.tenantName}</span>
          <span>&middot;</span>
          <span>{user.name}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-medium text-gray-900">Configuración</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-gray-600">Ubicacion</label>
              <SearchableSelect
                options={locations.map((l) => ({ value: l.id, label: l.name }))}
                value={locationId}
                onChange={setLocationId}
                placeholder="Seleccionar ubicación..."
                allowClear={false}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">Cliente (opcional)</label>
              <SearchableSelect
                options={[
                  { value: "", label: "Sin cliente" },
                  ...customers.map((c) => ({ value: c.id, label: c.name })),
                ]}
                value={customerId}
                onChange={setCustomerId}
                placeholder="Buscar cliente..."
              />
            </div>
          </div>

          <h3 className="mb-4 mt-6 font-medium text-gray-900">Agregar producto</h3>
          <div className="flex gap-2">
            <div className="flex-1">
              <SearchableSelect
                options={productOptions}
                value={selectedProductId}
                onChange={setSelectedProductId}
                placeholder="Buscar producto..."
              />
            </div>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm"
              placeholder="Cant."
            />
            <button
              type="button"
              onClick={addToCart}
              disabled={!selectedProductId}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              Agregar
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-medium text-gray-900">Carrito</h3>
          {cart.length === 0 ? (
            <p className="py-8 text-center text-gray-500">No hay productos en el carrito</p>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2"
                >
                  <div>
                    <span className="font-medium text-gray-900">{item.productName}</span>
                    <span className="ml-2 text-sm text-gray-500">
                      {item.quantity} x L{item.unitPrice} = L{item.total.toFixed(2)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.productId)}
                    className="rounded p-1 text-red-500 hover:bg-red-50"
                    title="Quitar"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 space-y-2 border-t border-gray-200 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>L{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Descuento</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-24 rounded border border-gray-300 px-2 py-1 text-sm"
              />
            </div>
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>L{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm text-gray-600">Método de pago</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as "CASH" | "TRANSFER" | "CARD")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="CASH">Efectivo</option>
              <option value="CARD">Tarjeta</option>
              <option value="TRANSFER">Transferencia</option>
            </select>
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="mt-6 w-full rounded-lg bg-emerald-600 py-3 font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {submitting ? "Procesando..." : "Registrar venta"}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <h3 className="border-b border-gray-200 px-4 py-3 font-medium text-gray-900">Ventas recientes</h3>
        {salesLoading ? (
          <div className="p-8 text-center text-gray-500">Cargando ventas...</div>
        ) : sales.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No hay ventas registradas</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">Ubicación</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">Cliente</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-600">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-600">Factura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sales.slice(0, 10).map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(sale.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{sale.location?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{sale.customer?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      L{sale.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
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
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Facturar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
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
    </div>
  );
}
