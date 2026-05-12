import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Modal } from "@/shared/ui/Modal";
import { ImageCropModal, PRODUCT_IMAGE_MAX_PIXELS } from "@/shared/ui/ImageCropModal";
import { SearchableSelect } from "@/shared/ui/SearchableSelect";
import { productsApi } from "../api/productsApi";
import type { CreateProductInput, Product, UpdateProductInput } from "../types/product.types";

const HELP_TOOLTIP_W = 256;

function toYmdFromIso(iso: string | undefined | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/** Ayuda con “?” discreto: tooltip fijo (portal) sin mover el formulario. Solo este subárbol se repinta al abrir/cerrar. */
function FieldHelp({ text }: { text: string }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    if (!open || !btnRef.current) {
      setRect(null);
      return;
    }
    setRect(btnRef.current.getBoundingClientRect());
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    const onScroll = () => {
      if (btnRef.current) setRect(btnRef.current.getBoundingClientRect());
    };
    const onReposition = () => onScroll();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onReposition);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onReposition);
    };
  }, [open]);

  const top = rect ? rect.bottom + 6 : 0;
  const left = rect
    ? Math.min(rect.left, window.innerWidth - HELP_TOOLTIP_W - 8)
    : 0;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="p-0 text-sm font-medium text-gray-400 antialiased leading-none border-0 bg-transparent shadow-none outline-none transition-colors hover:text-gray-500 focus-visible:text-gray-600"
        style={{ boxShadow: "none" }}
        aria-label="Más información"
        onPointerEnter={() => setOpen(true)}
        onPointerLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        ?
      </button>
      {open &&
        rect &&
        createPortal(
          <div
            role="tooltip"
            className="pointer-events-none fixed z-[1000] max-w-[min(16rem,calc(100vw-1rem))] rounded-md border border-white/5 bg-gray-900 px-2.5 py-2 text-left text-xs font-normal leading-snug text-white shadow-md"
            style={{ top, left, width: HELP_TOOLTIP_W }}
          >
            {text}
          </div>,
          document.body
        )}
    </>
  );
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  categories: { id: string; name: string }[];
  taxes: { id: string; name: string; rate: number }[];
  locations: { id: string; name: string }[];
  product?: Product | null;
  onSubmit: (data: CreateProductInput | (UpdateProductInput & { id: string })) => Promise<void>;
}

export function ProductFormModal({
  isOpen,
  onClose,
  tenantId,
  categories,
  taxes,
  locations,
  product,
  onSubmit,
}: ProductFormModalProps) {
  const isEdit = !!product;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [taxId, setTaxId] = useState("");
  const [type, setType] = useState("SIMPLE");
  const [unitType, setUnitType] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [trackStock, setTrackStock] = useState(true);
  const [allowDecimalInventory, setAllowDecimalInventory] = useState(false);
  const [expiresAtYmd, setExpiresAtYmd] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropImageFileType, setCropImageFileType] = useState("");
  const [quantityByLocation, setQuantityByLocation] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description ?? "");
      setCategoryId(product.categoryId ?? "");
      setTaxId(product.taxId ?? "");
      setType(product.type);
      setUnitType(product.unitType ?? "");
      setSku(product.sku ?? "");
      setBarcode(product.barcode ?? "");
      setCostPrice(product.costPrice != null ? String(product.costPrice) : "");
      setSalePrice(product.salePrice != null ? String(product.salePrice) : "");
      setTrackStock(product.trackStock);
      setAllowDecimalInventory(product.allowDecimalInventory ?? true);
      setExpiresAtYmd(toYmdFromIso(product.expiresAt));
      setImagePreview(product.images?.[0]?.url ?? null);
      const qty: Record<string, string> = {};
      locations.forEach((loc) => {
        const inv = product.inventory?.find((i) => i.locationId === loc.id);
        qty[loc.id] = inv ? String(inv.quantity) : "0";
      });
      setQuantityByLocation(qty);
    } else {
      setName("");
      setDescription("");
      setCategoryId("");
      setTaxId("");
      setType("SIMPLE");
      setUnitType("");
      setSku("");
      setBarcode("");
      setCostPrice("");
      setSalePrice("");
      setTrackStock(true);
      setAllowDecimalInventory(false);
      setExpiresAtYmd("");
      setImageFile(null);
      setImagePreview(null);
      if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
      setCropImageSrc(null);
      setCropImageFileType("");
      setCropModalOpen(false);
      const qty: Record<string, string> = {};
      locations.forEach((loc) => {
        qty[loc.id] = "0";
      });
      setQuantityByLocation(qty);
    }
  }, [product, isOpen, locations]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handlePriceInputChange =
    (setter: (value: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === "" || /^\d*(\.\d{0,2})?$/.test(value)) {
        setter(value);
      }
    };
  const costValue = parseFloat(costPrice);
  const saleValue = parseFloat(salePrice);
  const profitPercentage =
    Number.isFinite(costValue) &&
    Number.isFinite(saleValue) &&
    saleValue > 0
      ? ((saleValue - costValue) / saleValue) * 100
      : null;

  useEffect(() => {
    if (allowDecimalInventory) return;
    setQuantityByLocation((prev) => {
      const next = { ...prev };
      for (const k of Object.keys(next)) {
        const n = parseFloat(next[k] ?? "0");
        if (Number.isFinite(n)) {
          next[k] = String(Math.round(n));
        }
      }
      return next;
    });
  }, [allowDecimalInventory]);

  const handleLocationQtyChange = (locId: string, value: string) => {
    if (allowDecimalInventory) {
      if (value === "" || /^\d*(\.\d{0,2})?$/.test(value)) {
        setQuantityByLocation((prev) => ({ ...prev, [locId]: value }));
      }
    } else {
      if (value === "" || /^\d*$/.test(value)) {
        setQuantityByLocation((prev) => ({ ...prev, [locId]: value }));
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCropImageSrc(URL.createObjectURL(file));
      setCropImageFileType(file.type);
      setCropModalOpen(true);
    }
    e.target.value = "";
  };

  const handleCropConfirm = (croppedFile: File) => {
    setImageFile(croppedFile);
    setImagePreview(URL.createObjectURL(croppedFile));
    if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    setCropImageSrc(null);
    setCropImageFileType("");
    setCropModalOpen(false);
  };

  const handleCropClose = () => {
    if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    setCropImageSrc(null);
    setCropImageFileType("");
    setCropModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("El nombre es requerido");
      return;
    }
    if (!taxId) {
      setError("Debes seleccionar un impuesto");
      return;
    }
    setSubmitting(true);
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        const { url } = await productsApi.uploadImage(imageFile);
        imageUrl = url;
      }
      // Si es edición y no hay nueva imagen, no pasamos imageUrl (se mantienen las actuales)
      const inventoryByLocation = locations.map((loc) => {
        const raw = parseFloat(quantityByLocation[loc.id] ?? "0") || 0;
        const quantity = allowDecimalInventory ? raw : Math.round(raw);
        return { locationId: loc.id, quantity };
      });

      const expiresPayload = expiresAtYmd.trim() ? expiresAtYmd.trim() : null;

      if (isEdit && product) {
        await onSubmit({
          id: product.id,
          name: name.trim(),
          taxId,
          description: description.trim() || undefined,
          categoryId: categoryId || undefined,
          type,
          unitType: unitType.trim() || undefined,
          sku: sku.trim() || undefined,
          barcode: barcode.trim() || undefined,
          costPrice: costPrice ? Number(costPrice) : undefined,
          salePrice: salePrice ? Number(salePrice) : undefined,
          trackStock,
          allowDecimalInventory,
          expiresAt: expiresPayload,
          imageUrl,
          inventoryByLocation,
        });
      } else {
        await onSubmit({
          tenantId,
          name: name.trim(),
          taxId,
          description: description.trim() || undefined,
          categoryId: categoryId || undefined,
          type,
          unitType: unitType.trim() || undefined,
          sku: sku.trim() || undefined,
          barcode: barcode.trim() || undefined,
          costPrice: costPrice ? Number(costPrice) : undefined,
          salePrice: salePrice ? Number(salePrice) : undefined,
          trackStock,
          allowDecimalInventory,
          expiresAt: expiresPayload,
          imageUrl,
          inventoryByLocation,
        });
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setImageFile(null);
    if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    setCropImageSrc(null);
    setCropImageFileType("");
    setCropModalOpen(false);
    setError(null);
    onClose();
  };

  return (
    <>
      {cropModalOpen && cropImageSrc && (
        <ImageCropModal
          isOpen={cropModalOpen}
          onClose={handleCropClose}
          imageSrc={cropImageSrc}
          sourceFileType={cropImageFileType}
          maxPixels={PRODUCT_IMAGE_MAX_PIXELS}
          title="Recortar imagen del producto"
          outputFileName="producto"
          onConfirm={handleCropConfirm}
        />
      )}

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={isEdit ? "Editar producto" : "Nuevo producto"}
      >
      <form onSubmit={handleSubmit}>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <div className="max-h-[70vh] space-y-4 overflow-y-auto">
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
            <label className="mb-1 block text-sm text-gray-600">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Categoría</label>
            <SearchableSelect
              options={[
                { value: "", label: "Sin categoría" },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
              value={categoryId}
              onChange={setCategoryId}
              placeholder="Buscar categoría..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Impuesto *</label>
            <SearchableSelect
              options={[
                { value: "", label: taxes.length > 0 ? "Seleccionar impuesto..." : "No hay impuestos" },
                ...taxes.map((t) => ({ value: t.id, label: `${t.name} (${t.rate.toFixed(2)}%)` })),
              ]}
              value={taxId}
              onChange={setTaxId}
              placeholder="Buscar impuesto..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Tipo</label>
            <SearchableSelect
              options={[
                { value: "SIMPLE", label: "Simple" },
                { value: "VARIANT", label: "Variante" },
                { value: "SERVICE", label: "Servicio" },
              ]}
              value={type}
              onChange={setType}
              placeholder="Seleccionar tipo..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-gray-600">SKU</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">Código de barras</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm text-gray-600">Precio costo</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costPrice}
                onChange={handlePriceInputChange(setCostPrice)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">Precio venta</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={salePrice}
                onChange={handlePriceInputChange(setSalePrice)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">Ganancia %</label>
              <input
                type="text"
                disabled
                value={profitPercentage != null ? `${profitPercentage.toFixed(2)}%` : "--"}
                className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-600"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Unidad</label>
            <input
              type="text"
              value={unitType}
              onChange={(e) => setUnitType(e.target.value)}
              placeholder="unidad, kg, etc."
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <input
              type="checkbox"
              id="trackStock"
              checked={trackStock}
              onChange={(e) => setTrackStock(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="trackStock" className="text-sm text-gray-600">
              Controlar inventario
            </label>
            <FieldHelp
              text="Con esta opción activa, el sistema descuenta y hace seguimiento de existencias al vender o ajustar stock. Desactívala para productos que no llevas en almacén (p. ej. un servicio o artículo solo de catálogo)."
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <input
              type="checkbox"
              id="allowDecimalInventory"
              checked={allowDecimalInventory}
              onChange={(e) => setAllowDecimalInventory(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="allowDecimalInventory" className="text-sm text-gray-600">
              Permitir decimales en inventario
            </label>
            <FieldHelp
              text="Indica si las cantidades de inventario pueden llevar fracciones (2,5 kg) o solo números enteros (piezas). Afecta cómo se escriben las cantidades por sucursal en este formulario."
            />
          </div>
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <label className="text-sm text-gray-600" htmlFor="expiresAtYmd">
                Vencimiento (opcional)
              </label>
              <FieldHelp text="Fecha aproximada de caducidad o consumo preferente. Se usa en el reporte Vencen pronto (productos con stock y control de inventario)." />
            </div>
            <input
              id="expiresAtYmd"
              type="date"
              value={expiresAtYmd}
              onChange={(e) => setExpiresAtYmd(e.target.value)}
              className="w-full max-w-xs rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          {locations.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-600">
                Cantidad por sucursal
              </label>
              <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                {locations.map((loc) => (
                  <div key={loc.id} className="flex items-center gap-3">
                    <span className="min-w-[120px] text-sm text-gray-700">
                      {loc.name}
                    </span>
                    <input
                      type="text"
                      inputMode={allowDecimalInventory ? "decimal" : "numeric"}
                      value={quantityByLocation[loc.id] ?? "0"}
                      onChange={(e) => handleLocationQtyChange(loc.id, e.target.value)}
                      className="w-24 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm text-gray-600">Imagen (opcional)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
              className="w-full text-sm text-gray-600 file:mr-2 file:rounded file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-emerald-700"
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview.startsWith("/") ? imagePreview : imagePreview}
                  alt="Vista previa"
                  className="h-24 w-24 rounded border object-cover"
                />
              </div>
            )}
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
            disabled={submitting}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {submitting ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
    </>
  );
}
