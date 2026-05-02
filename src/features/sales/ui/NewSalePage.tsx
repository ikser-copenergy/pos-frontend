import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/core/auth/AuthContext";
import { useLocations } from "@/features/inventory/hooks/useInventory";
import { productsApi } from "@/features/products/api/productsApi";
import { customersApi } from "@/features/customers/api/customersApi";
import { SearchableSelect } from "@/shared/ui/SearchableSelect";
import { Modal } from "@/shared/ui/Modal";
import { useSales } from "../hooks/useSales";
import { InvoiceModal } from "./InvoiceModal";
import type { Product } from "@/features/products/types/product.types";
import type { Customer } from "@/features/customers/types/customer.types";
import type { Sale } from "../types/sale.types";
import type { Invoice } from "../types/invoice.types";

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export function NewSalePage() {
  const navigate = useNavigate();
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
  const [amountToCharge, setAmountToCharge] = useState("");
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [debouncedProductSearchTerm, setDebouncedProductSearchTerm] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [debouncedCustomerSearchTerm, setDebouncedCustomerSearchTerm] = useState("");
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const { locations } = useLocations(tenantId || undefined);
  const { create, updateSaleInvoice } = useSales(tenantId || undefined);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedProductSearchTerm(productSearchTerm.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [productSearchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCustomerSearchTerm(customerSearchTerm.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [customerSearchTerm]);

  useEffect(() => {
    if (!tenantId) return;
    if (debouncedProductSearchTerm.length < 3) {
      setProducts([]);
      setLoadingProducts(false);
      return;
    }

    let cancelled = false;
    setLoadingProducts(true);

    productsApi
      .getAll(tenantId, { search: debouncedProductSearchTerm })
      .then((data) => {
        if (cancelled) return;
        setProducts(data);
      })
      .catch(() => {
        if (cancelled) return;
        setProducts([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingProducts(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tenantId, debouncedProductSearchTerm]);

  useEffect(() => {
    if (!tenantId) return;
    if (debouncedCustomerSearchTerm.length < 3) {
      setCustomers([]);
      setLoadingCustomers(false);
      return;
    }

    let cancelled = false;
    setLoadingCustomers(true);

    customersApi
      .getAll(tenantId, { search: debouncedCustomerSearchTerm })
      .then((data) => {
        if (cancelled) return;
        setCustomers(data);
      })
      .catch(() => {
        if (cancelled) return;
        setCustomers([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingCustomers(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tenantId, debouncedCustomerSearchTerm]);

  useEffect(() => {
    if (!locations.length || locationId) return;
    const preferred =
      user?.defaultLocationId &&
      locations.some((l) => l.id === user.defaultLocationId)
        ? user.defaultLocationId
        : locations[0].id;
    setLocationId(preferred);
  }, [locations, locationId, user?.defaultLocationId]);

  const activeProducts = products.filter((p) => !p.archived);
  const productOptions = [
    { value: "", label: "Seleccionar producto..." },
    ...activeProducts.map((p) => ({
      value: p.id,
      label: `${p.name}${p.salePrice != null ? ` - L${p.salePrice}` : ""}`,
    })),
  ];

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) ?? null,
    [products, selectedProductId]
  );
  const allowDecimalQty = selectedProduct?.allowDecimalInventory ?? false;

  const handleQuantityChange = (value: string) => {
    if (allowDecimalQty) {
      if (value === "" || /^\d*(\.\d{0,2})?$/.test(value)) {
        setQuantity(value);
      }
      return;
    }
    if (value === "" || /^\d+$/.test(value)) {
      setQuantity(value);
    }
  };

  const addToCart = () => {
    if (!selectedProductId || !quantity || parseFloat(quantity) <= 0) return;
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;
    const price = product.salePrice ?? 0;
    const rawQty = parseFloat(quantity);
    const qty = product.allowDecimalInventory
      ? Number(rawQty.toFixed(2))
      : Math.max(1, Math.trunc(rawQty));
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
    setProductSearchTerm("");
    setDebouncedProductSearchTerm("");
    setShowAddProductModal(false);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const subtotal = cart.reduce((s, i) => s + i.total, 0);
  const discountVal = parseFloat(discount) || 0;
  const total = Math.max(0, subtotal - discountVal);

  const chargeAmount = Math.min(
    Math.max(0, parseFloat(amountToCharge) || 0),
    total
  );

  useEffect(() => {
    if (cart.length > 0) setAmountToCharge(String(total));
    else setAmountToCharge("");
  }, [total, cart.length]);

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
        payments:
          chargeAmount > 0
            ? [{ method: paymentMethod, amount: chargeAmount }]
            : [],
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
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/ventas")}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            title="Volver al historial"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold text-gray-900">Nueva venta</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{user.tenantName}</span>
          <span>&middot;</span>
          <span>{user.name}</span>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-medium text-gray-900">Carrito</h3>
          <button
            type="button"
            onClick={() => setShowAddProductModal(true)}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            + Agregar producto
          </button>
        </div>

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
          <label className="mb-1 block text-sm text-gray-600">Monto a cobrar</label>
          <input
            type="number"
            min="0"
            max={total}
            step="0.01"
            value={amountToCharge}
            onChange={(e) => setAmountToCharge(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            placeholder="0"
          />
          <p className="mt-1 text-xs text-gray-500">Máximo: L{total.toFixed(2)}</p>
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
          className="mt-4 w-full rounded-lg bg-emerald-600 py-3 font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {submitting ? "Procesando..." : "Registrar venta"}
        </button>
      </div>

      <Modal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        title="Agregar producto"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-600">Ubicación</label>
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
              onInputChange={setCustomerSearchTerm}
              placeholder="Buscar cliente..."
              noOptionsMessage={(inputValue) => {
                const trimmed = inputValue.trim();
                if (trimmed.length < 3) {
                  return "Escribe al menos 3 letras para buscar clientes";
                }
                return loadingCustomers
                  ? "Buscando clientes..."
                  : `Sin resultados para "${trimmed}"`;
              }}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-600">Producto</label>
            <SearchableSelect
              options={productOptions}
              value={selectedProductId}
              onChange={setSelectedProductId}
              onInputChange={setProductSearchTerm}
              placeholder="Buscar producto..."
              noOptionsMessage={(inputValue) => {
                const trimmed = inputValue.trim();
                if (trimmed.length < 3) {
                  return "Escribe al menos 3 letras para buscar productos";
                }
                return loadingProducts
                  ? "Buscando productos..."
                  : `Sin resultados para "${trimmed}"`;
              }}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-600">Cantidad</label>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-center text-sm"
              placeholder="Cant."
            />
            <p className="mt-1 text-xs text-gray-500">
              {allowDecimalQty
                ? "Este producto permite decimales (máximo 2). Las flechas suben/bajan en enteros."
                : "Este producto solo permite cantidades enteras."}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddProductModal(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
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
      </Modal>

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
