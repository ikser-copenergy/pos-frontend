import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth/AuthContext";
import { ImageCropModal } from "@/shared/ui/ImageCropModal";

export function RegisterPage() {
  const { register } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [tenantName, setTenantName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropImageFileType, setCropImageFileType] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canProceedStep1 =
    userData.firstName.trim() &&
    userData.lastName.trim() &&
    userData.email.trim() &&
    userData.password.length >= 6 &&
    /^\d{8}$/.test(userData.phone.trim());

  const canSubmitStep2 = tenantName.trim().length > 0;

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canProceedStep1) return;
    setError(null);
    setStep(2);
  };

  const handleStep2Back = () => {
    setError(null);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(null);
    setLogoPreview(null);
    setStep(1);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCropImageSrc(URL.createObjectURL(file));
      setCropImageFileType(file.type);
      setCropModalOpen(true);
    }
    e.target.value = "";
  };

  const handleCropConfirm = (croppedFile: File) => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(croppedFile);
    setLogoPreview(URL.createObjectURL(croppedFile));
    if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    setCropImageSrc(null);
    setCropModalOpen(false);
  };

  const handleCropClose = () => {
    if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    setCropImageSrc(null);
    setCropImageFileType("");
    setCropModalOpen(false);
  };

  const handleLogoRemove = () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitStep2) return;
    setError(null);
    setLoading(true);
    try {
      await register({
        user: {
          firstName: userData.firstName.trim(),
          lastName: userData.lastName.trim(),
          email: userData.email.trim().toLowerCase(),
          password: userData.password,
          phone: userData.phone.trim(),
        },
        tenant: {
          name: tenantName.trim(),
          ...(logoFile ? { logo: logoFile } : {}),
        },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">POS</h1>
          <p className="mt-2 text-gray-600">
            {step === 1 ? "Datos del usuario" : "Datos del negocio"}
          </p>
        </div>

        {/* Indicador de pasos */}
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              step === 1 ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              step === 1 ? "bg-white/25" : "bg-gray-200"
            }`}>
              1
            </span>
            Usuario
          </button>
          <div className="h-6 w-px bg-gray-200" />
          <button
            type="button"
            onClick={() => canProceedStep1 && setStep(2)}
            disabled={!canProceedStep1}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
              step === 2 ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              step === 2 ? "bg-white/25" : "bg-gray-200"
            }`}>
              2
            </span>
            Negocio
          </button>
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

        <form
          onSubmit={step === 1 ? handleStep1Next : handleSubmit}
          className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm"
        >
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={userData.firstName}
                    onChange={(e) => setUserData((p) => ({ ...p, firstName: e.target.value }))}
                    placeholder="Juan"
                    autoComplete="given-name"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={userData.lastName}
                    onChange={(e) => setUserData((p) => ({ ...p, lastName: e.target.value }))}
                    placeholder="Pérez"
                    autoComplete="family-name"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData((p) => ({ ...p, email: e.target.value }))}
                  placeholder="correo@ejemplo.com"
                  autoComplete="email"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Teléfono (8 dígitos)
                </label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-100 px-4 py-3 text-gray-600">
                    +504
                  </span>
                  <input
                    type="tel"
                    value={userData.phone}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 8);
                      setUserData((p) => ({ ...p, phone: v }));
                    }}
                    placeholder="99991234"
                    maxLength={8}
                    inputMode="numeric"
                    pattern="\d{8}"
                    className="w-full rounded-r-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Contraseña (mín. 6 caracteres)
                </label>
                <input
                  type="password"
                  value={userData.password}
                  onChange={(e) => setUserData((p) => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={!canProceedStep1}
                className="mt-6 w-full rounded-lg bg-emerald-600 py-3 font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
              >
                Siguiente →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nombre del negocio
                </label>
                <input
                  type="text"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  placeholder="Mi Tienda"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Logo del negocio (opcional)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleLogoChange}
                  className="w-full text-sm text-gray-600 file:mr-2 file:rounded file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-emerald-700"
                />
                {logoPreview && (
                  <div className="mt-2 flex items-center gap-3">
                    <img
                      src={logoPreview}
                      alt="Vista previa del logo"
                      className="h-20 w-20 rounded border object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleLogoRemove}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Quitar
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={handleStep2Back}
                  className="flex-1 rounded-lg border border-gray-300 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  ← Volver
                </button>
                <button
                  type="submit"
                  disabled={!canSubmitStep2 || loading}
                  className="flex-1 rounded-lg bg-emerald-600 py-3 font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                >
                  {loading ? "Creando..." : "Crear cuenta"}
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
