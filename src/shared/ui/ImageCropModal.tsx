import { useState, useRef, useCallback } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const DEFAULT_MAX_PIXELS = 1024 * 1024; // ~1 megapixel (logos)
/** Resolución equilibrada para productos (POS/webstore): liviana, buen detalle */
export const PRODUCT_IMAGE_MAX_PIXELS = 800 * 800;

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  /** Tipo MIME del archivo original (ej. image/png) para preservar transparencia */
  sourceFileType?: string;
  /** Máx. píxeles (ancho×alto). Por defecto 1MP. Para productos: 800×800 */
  maxPixels?: number;
  /** Título del modal */
  title?: string;
  /** Nombre base del archivo de salida (sin extensión) */
  outputFileName?: string;
  onConfirm: (croppedFile: File) => void | Promise<void>;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop(
      { unit: "%", width: 100 },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

const FORMATS_WITH_ALPHA = ["image/png", "image/gif", "image/webp"];

async function getCroppedBlob(
  image: HTMLImageElement,
  crop: PixelCrop,
  maxPixels: number = DEFAULT_MAX_PIXELS,
  preserveAlpha: boolean = false
): Promise<{ blob: Blob; mime: string; ext: string }> {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const cropWidth = Math.floor(crop.width * scaleX);
  const cropHeight = Math.floor(crop.height * scaleY);
  const cropX = Math.floor(crop.x * scaleX);
  const cropY = Math.floor(crop.y * scaleY);

  let outputWidth = cropWidth;
  let outputHeight = cropHeight;

  if (cropWidth * cropHeight > maxPixels) {
    const scale = Math.sqrt(maxPixels / (cropWidth * cropHeight));
    outputWidth = Math.floor(cropWidth * scale);
    outputHeight = Math.floor(cropHeight * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2d context");

  ctx.imageSmoothingQuality = "high";
  if (preserveAlpha) {
    ctx.clearRect(0, 0, outputWidth, outputHeight);
  }
  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    outputWidth,
    outputHeight
  );

  const mime = preserveAlpha ? "image/png" : "image/jpeg";
  const ext = preserveAlpha ? "png" : "jpg";

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve({ blob, mime, ext });
        else reject(new Error("Canvas toBlob failed"));
      },
      mime,
      preserveAlpha ? undefined : 0.92
    );
  });
}

export function ImageCropModal({
  isOpen,
  onClose,
  imageSrc,
  sourceFileType,
  maxPixels = DEFAULT_MAX_PIXELS,
  title = "Recortar imagen (formato cuadrado)",
  outputFileName = "image",
  onConfirm,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [submitting, setSubmitting] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }, []);

  const handleConfirm = async () => {
    if (!completedCrop?.width || !completedCrop?.height || !imgRef.current) return;
    setSubmitting(true);
    try {
      const preserveAlpha = sourceFileType
        ? FORMATS_WITH_ALPHA.includes(sourceFileType.toLowerCase())
        : false;
      const { blob, mime, ext } = await getCroppedBlob(
        imgRef.current,
        completedCrop,
        maxPixels,
        preserveAlpha
      );
      const file = new File([blob], `${outputFileName}.${ext}`, { type: mime });
      await onConfirm(file);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Cerrar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="max-h-[60vh] overflow-auto rounded-lg bg-gray-100">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            keepSelection
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Recortar"
              onLoad={onImageLoad}
              className="max-h-[50vh] w-auto"
            />
          </ReactCrop>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          La imagen se redimensionará automáticamente para cargar rápido y mantener buen detalle.
        </p>
        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!completedCrop || submitting}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {submitting ? "Procesando..." : "Usar recorte"}
          </button>
        </div>
      </div>
    </div>
  );
}
