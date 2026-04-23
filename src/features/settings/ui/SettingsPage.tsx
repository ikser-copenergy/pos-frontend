import { useState } from "react";
import { useAuth } from "@/core/auth/AuthContext";
import { useSettings } from "../hooks/useSettings";
import { useLocations } from "@/features/locations/hooks/useLocations";
import { tenantsApi } from "@/features/inventory/api/tenantsApi";
import { ImageCropModal } from "@/shared/ui/ImageCropModal";
import { LocationFormModal } from "@/features/locations/ui/LocationFormModal";
import { IconEdit, IconTrash } from "@/shared/ui/icons";
import { ConfirmModal } from "@/shared/ui/ConfirmModal";
import type {
  Location,
  CreateLocationInput,
  UpdateLocationInput,
} from "@/features/locations/types/location.types";

const MAX_LOCATIONS = 3;
const MIN_LOCATIONS = 1;
const PRESET_KEYS = [
  { key: "businessName", label: "Nombre del negocio", placeholder: "Mi Tienda" },
  { key: "currency", label: "Símbolo de moneda", placeholder: "L" },
  { key: "taxRate", label: "Tasa de impuesto (%)", placeholder: "15" },
  { key: "invoicePrefix", label: "Prefijo de factura", placeholder: "FAC" },
  { key: "address", label: "Dirección", placeholder: "Calle Principal 123" },
  { key: "phone", label: "Teléfono", placeholder: "+504 9999-9999" },
] as const;

export function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const tenantId = user?.tenantId ?? "";
  const { loading, error, getValue, upsert } = useSettings(tenantId || undefined);
  const {
    locations,
    loading: locationsLoading,
    error: locationsError,
    create: createLocation,
    update: updateLocation,
    remove: removeLocation,
  } = useLocations(tenantId || undefined);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [deletingLocation, setDeletingLocation] = useState<Location | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropImageFileType, setCropImageFileType] = useState<string>("");

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const getDisplayValue = (key: string) =>
    key in values ? values[key] : getValue(key);

  const handleSaveAll = async () => {
    if (!tenantId) return;
    setSaving(true);
    try {
      for (const { key } of PRESET_KEYS) {
        await upsert({
          tenantId,
          key,
          value: getDisplayValue(key),
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLocationSubmit = async (
    data: CreateLocationInput | (UpdateLocationInput & { id: string })
  ) => {
    if ("id" in data) {
      const { id, ...rest } = data;
      await updateLocation(id, rest);
      setEditingLocation(null);
    } else {
      await createLocation(data);
      setShowLocationModal(false);
    }
  };

  const handleLocationDeleteClick = (loc: Location) => {
    if (locations.length <= MIN_LOCATIONS) return;
    setDeletingLocation(loc);
  };

  const handleLocationDeleteConfirm = async () => {
    if (!deletingLocation) return;
    await removeLocation(deletingLocation.id);
    setDeletingLocation(null);
  };

  const handleSetMain = async (loc: Location) => {
    if (loc.isMain) return;
    await updateLocation(loc.id, { isMain: true });
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || user.role !== "ADMIN") return;
    setCropImageSrc(URL.createObjectURL(file));
    setCropImageFileType(file.type);
    setCropModalOpen(true);
    e.target.value = "";
  };

  const handleCropConfirm = async (croppedFile: File) => {
    if (!user) return;
    setLogoUploading(true);
    try {
      await tenantsApi.updateLogo(croppedFile);
      await refreshUser();
    } finally {
      setLogoUploading(false);
      if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
      setCropImageSrc(null);
      setCropModalOpen(false);
    }
  };

  const handleCropClose = () => {
    if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    setCropImageSrc(null);
    setCropModalOpen(false);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Configuraciones</h2>
        <p className="mt-1 text-sm text-gray-500">
          Configuración general del negocio para {user.tenantName}
        </p>
      </div>

      {cropModalOpen && cropImageSrc && (
        <ImageCropModal
          isOpen={cropModalOpen}
          onClose={handleCropClose}
          imageSrc={cropImageSrc}
          sourceFileType={cropImageFileType}
          title="Recortar logo (formato cuadrado)"
          outputFileName="logo"
          onConfirm={handleCropConfirm}
        />
      )}

      {user.role === "ADMIN" && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-medium text-gray-700">Logo del negocio</h3>
          <div className="flex items-center gap-4">
            {user.tenantLogoUrl ? (
              <img
                src={user.tenantLogoUrl}
                alt="Logo"
                className="h-16 w-16 rounded border object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded border bg-gray-100 text-gray-400">
                Sin logo
              </div>
            )}
            <div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleLogoSelect}
                disabled={logoUploading}
                className="text-sm text-gray-600 file:mr-2 file:rounded file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-emerald-700"
              />
              {logoUploading && <span className="ml-2 text-sm text-gray-500">Subiendo...</span>}
            </div>
          </div>
        </div>
      )}

      {(error || locationsError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error || locationsError}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
          Cargando configuraciones...
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="divide-y divide-gray-200">
            {PRESET_KEYS.map(({ key, label, placeholder }) => (
              <div
                key={key}
                className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={getDisplayValue(key)}
                    onChange={(e) => handleChange(key, e.target.value)}
                    placeholder={placeholder}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:max-w-xs"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 px-4 py-4">
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Ubicaciones</h3>
            <p className="mt-0.5 text-sm text-gray-500">
              Mínimo {MIN_LOCATIONS}, máximo {MAX_LOCATIONS}. Selecciona una como principal.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingLocation(null);
              setShowLocationModal(true);
            }}
            disabled={locations.length >= MAX_LOCATIONS}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Nueva ubicación
          </button>
        </div>

        <LocationFormModal
          isOpen={showLocationModal}
          onClose={() => {
            setShowLocationModal(false);
            setEditingLocation(null);
          }}
          tenantId={tenantId}
          location={editingLocation}
          onSubmit={handleLocationSubmit}
        />

        <ConfirmModal
          isOpen={!!deletingLocation}
          onClose={() => setDeletingLocation(null)}
          onConfirm={handleLocationDeleteConfirm}
          title="Eliminar ubicación"
          message={
            deletingLocation
              ? `¿Eliminar la ubicación "${deletingLocation.name}"?`
              : ""
          }
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
        />

        {locationsLoading ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
            Cargando ubicaciones...
          </div>
        ) : locations.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
            No hay ubicaciones. Crea al menos una.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                    Dirección
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                    Principal
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {loc.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {loc.address ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleSetMain(loc)}
                        disabled={loc.isMain}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          loc.isMain
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                        } disabled:cursor-default`}
                      >
                        {loc.isMain ? "Principal" : "Establecer como principal"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingLocation(loc);
                            setShowLocationModal(true);
                          }}
                          className="rounded p-2 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600"
                          title="Editar"
                        >
                          <IconEdit />
                        </button>
                        <button
                          onClick={() => handleLocationDeleteClick(loc)}
                          disabled={locations.length <= MIN_LOCATIONS}
                          className="rounded p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Eliminar"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
