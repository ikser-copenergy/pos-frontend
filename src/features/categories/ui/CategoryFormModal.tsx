import { useState, useEffect } from "react";
import { Modal } from "@/shared/ui/Modal";
import { SearchableSelect } from "@/shared/ui/SearchableSelect";
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../types/category.types";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  categories: Category[];
  category?: Category | null;
  onSubmit: (
    data: CreateCategoryInput | (UpdateCategoryInput & { id: string })
  ) => Promise<void>;
}

export function CategoryFormModal({
  isOpen,
  onClose,
  tenantId,
  categories,
  category,
  onSubmit,
}: CategoryFormModalProps) {
  const isEdit = !!category;
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parentOptions = categories.filter((c) => !isEdit || c.id !== category?.id);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setParentId(category.parentId ?? "");
    } else {
      setName("");
      setParentId("");
    }
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("El nombre es requerido");
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit && category) {
        await onSubmit({
          id: category.id,
          name: name.trim(),
          parentId: parentId || undefined,
        });
      } else {
        await onSubmit({
          tenantId,
          name: name.trim(),
          parentId: parentId || undefined,
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Editar categoría" : "Nueva categoría"}
    >
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
            <label className="mb-1 block text-sm text-gray-600">
              Categoría padre
            </label>
            <SearchableSelect
              options={[
                { value: "", label: "Sin categoría padre" },
                ...parentOptions.map((c) => ({ value: c.id, label: c.name })),
              ]}
              value={parentId}
              onChange={setParentId}
              placeholder="Buscar categoría padre..."
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
