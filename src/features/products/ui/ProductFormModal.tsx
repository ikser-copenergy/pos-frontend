import { useState, useEffect } from "react";
import { Modal } from "@/shared/ui/Modal";
import { productsApi } from "../api/productsApi";
import type { CreateProductInput, Product, UpdateProductInput } from "../types/product.types";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  categories: { id: string; name: string }[];
  product?: Product | null;
  onSubmit: (data: CreateProductInput | (UpdateProductInput & { id: string })) => Promise<void>;
}

export function ProductFormModal({
  isOpen,
  onClose,
  tenantId,
  categories,
  product,
  onSubmit,
}: ProductFormModalProps) {
  const isEdit = !!product;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState("SIMPLE");
  const [unitType, setUnitType] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [trackStock, setTrackStock] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description ?? "");
      setCategoryId(product.categoryId ?? "");
      setType(product.type);
      setUnitType(product.unitType ?? "");
      setSku(product.sku ?? "");
      setBarcode(product.barcode ?? "");
      setCostPrice(product.costPrice != null ? String(product.costPrice) : "");
      setSalePrice(product.salePrice != null ? String(product.salePrice) : "");
      setTrackStock(product.trackStock);
      setImagePreview(product.images?.[0]?.url ?? null);
    } else {
      setName("");
      setDescription("");
      setCategoryId("");
      setType("SIMPLE");
      setUnitType("");
      setSku("");
      setBarcode("");
      setCostPrice("");
      setSalePrice("");
      setTrackStock(true);
      setImageFile(null);
      setImagePreview(null);
    }
  }, [product, isOpen]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(product?.images?.[0]?.url ?? null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("El nombre es requerido");
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
      if (isEdit && product) {
        await onSubmit({
          id: product.id,
          name: name.trim(),
          description: description.trim() || undefined,
          categoryId: categoryId || undefined,
          type,
          unitType: unitType.trim() || undefined,
          sku: sku.trim() || undefined,
          barcode: barcode.trim() || undefined,
          costPrice: costPrice ? Number(costPrice) : undefined,
          salePrice: salePrice ? Number(salePrice) : undefined,
          trackStock,
          imageUrl,
        });
      } else {
        await onSubmit({
          tenantId,
          name: name.trim(),
          description: description.trim() || undefined,
          categoryId: categoryId || undefined,
          type,
          unitType: unitType.trim() || undefined,
          sku: sku.trim() || undefined,
          barcode: barcode.trim() || undefined,
          costPrice: costPrice ? Number(costPrice) : undefined,
          salePrice: salePrice ? Number(salePrice) : undefined,
          trackStock,
          imageUrl,
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
    setError(null);
    onClose();
  };

  return (
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
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none"
            >
              <option value="">Sin categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none"
            >
              <option value="SIMPLE">Simple</option>
              <option value="VARIANT">Variante</option>
              <option value="SERVICE">Servicio</option>
            </select>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-gray-600">Precio costo</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
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
                onChange={(e) => setSalePrice(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none"
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
          <div className="flex items-center gap-2">
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
          </div>
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
  );
}
