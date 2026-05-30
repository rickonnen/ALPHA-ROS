"use client";

/**
 * @Dev: Rodrigo Chalco - Daniel Condarco
 * Componente: PublicarInmuebleGuide
 */

import { useState, useCallback, useEffect } from "react";

interface Step {
  number: string;
  title: string;
  description: string;
  tag: string;
  detail: string;
}

interface GalleryImage {
  url: string;
  label: string;
}

function optimizeCloudinaryUrl(strUrl: string): string {
  if (!strUrl.includes("cloudinary.com") || !strUrl.includes("/upload/")) return strUrl;

  return strUrl.replace(
    "/upload/",
    "/upload/c_limit,w_1400,q_auto:good,f_auto/"
  );
}

// ─ Datos

const ARR_STEPS: Step[] = [
  {
    number: "01",
    title: "Datos del aviso",
    tag: "Obligatorio",
    description: "Título, operación y precio",
    detail:
      "Escribe un título claro y específico (ej: 'Departamento 3 dormitorios, zona norte'). Selecciona el tipo de operación: Venta, Alquiler o Anticrético. Define el precio y la moneda (USD o Bs).",
  },
  {
    number: "02",
    title: "Categoría y estado",
    tag: "Obligatorio",
    description: "Tipo de inmueble y estado",
    detail:
      "Selecciona el tipo de propiedad: Casa, Departamento, Terreno, etc. Luego elige el estado: En Planos (proyecto), En Construcción (en obra) o Entrega Inmediata (lista para habitar).",
  },
  {
    number: "03",
    title: "Ubicación",
    tag: "Obligatorio",
    description: "Departamento, dirección y zona",
    detail:
      "Registra el departamento, la dirección exacta de la propiedad y la zona de referencia. Una ubicación precisa mejora hasta un 60% la visibilidad en búsquedas.",
  },
  {
    number: "04",
    title: "Características",
    tag: "Obligatorio",
    description: "Habitaciones, baños y superficie",
    detail:
      "Completa la cantidad de habitaciones, baños, garajes, plantas y la superficie en m². Estos datos son clave para el sistema de coincidencias de PropBol.",
  },
  {
    number: "05",
    title: "Imágenes",
    tag: "Obligatorio",
    description: "Hasta 5 fotografías",
    detail:
      "Sube entre 1 y 5 fotos de la propiedad. Usa buena iluminación natural, muestra todos los ambientes principales y evita fotos borrosas. Las publicaciones con 3+ fotos reciben 3 veces más visitas.",
  },
  {
    number: "06",
    title: "Video",
    tag: "Opcional",
    description: "YouTube o Instagram Reel",
    detail:
      "Si tienes un recorrido en video, pega el enlace de YouTube o Instagram Reel. Este paso es completamente opcional pero aumenta significativamente el interés de los compradores.",
  },
  {
    number: "07",
    title: "Descripción y extras",
    tag: "Obligatorio",
    description: "Descripción + campos personalizados",
    detail:
      "Redacta una descripción completa (hasta 1500 caracteres). Agrega hasta 4 características extras personalizadas como 'Estado de construcción: En construcción' o 'Fecha de entrega: Diciembre 2025'.",
  },
];

const ARR_GALLERY: GalleryImage[] = [
  {
    url: "https://res.cloudinary.com/dj1mlj3vz/image/upload/v1778436394/parte1_eigb8m.png",
    label: "Datos del aviso",
  },
  {
    url: "https://res.cloudinary.com/dj1mlj3vz/image/upload/v1778436394/parte2_gyi6sn.png",
    label: "Categoría y estado",
  },
  {
    url: "https://res.cloudinary.com/dj1mlj3vz/image/upload/v1778437887/parte3.1_vry4mp.png",
    label: "Ubicación",
  },
  {
    url: "https://res.cloudinary.com/dj1mlj3vz/image/upload/v1778436394/Parte4_kfsgoa.png",
    label: "Características",
  },
  {
    url: "https://res.cloudinary.com/dj1mlj3vz/image/upload/v1778436394/parte5_flgju3.png",
    label: "Imágenes",
  },
  {
    url: "https://res.cloudinary.com/dj1mlj3vz/image/upload/v1778436394/parte6_iyypma.png",
    label: "Video",
  },
  {
    url: "https://res.cloudinary.com/dj1mlj3vz/image/upload/v1779062930/parte7.4_shhwb9.png",
    label: "Descripción y extras",
  },
];

function ImageSkeleton() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background">
      <div className="w-full h-full animate-pulse bg-gradient-to-r from-muted via-card-bg to-muted bg-[length:200%_100%]" />

      <div className="absolute flex flex-col items-center gap-2 text-muted-foreground">
        <svg
          className="w-10 h-10 opacity-30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>

        <span className="text-xs font-medium opacity-50">
          Cargando imagen...
        </span>
      </div>
    </div>
  );
}

function LazyImage({
  src,
  alt,
  imageClassName = "p-6",
  bolInline = false,
}: {
  src: string;
  alt: string;
  imageClassName?: string;
  bolInline?: boolean;
}) {
  const [bolLoaded, setBolLoaded] = useState(false);
  const [bolError, setBolError] = useState(false);
  const strOptimized = optimizeCloudinaryUrl(src);

  useEffect(() => {
    setBolLoaded(false);
    setBolError(false);
  }, [src]);

  if (bolInline) {
    return (
      <div className="relative w-full bg-background">
        {!bolLoaded && !bolError && (
          <div className="w-full aspect-video relative">
            <ImageSkeleton />
          </div>
        )}

        <img
          src={strOptimized}
          alt={alt}
          onLoad={() => setBolLoaded(true)}
          onError={() => setBolError(true)}
          className={`w-full h-auto block rounded-xl drop-shadow-md transition-opacity duration-500 ${
            bolLoaded ? "opacity-100" : "opacity-0 hidden"
          } ${imageClassName}`}
        />

        {bolError && (
          <div className="w-full aspect-video flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <svg
              className="w-10 h-10 opacity-30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>

            <span className="text-xs opacity-50">
              No se pudo cargar la imagen
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {!bolLoaded && !bolError && <ImageSkeleton />}

      <img
        src={strOptimized}
        alt={alt}
        onLoad={() => setBolLoaded(true)}
        onError={() => setBolError(true)}
        className={`absolute inset-0 w-full h-full object-contain ${imageClassName} rounded-xl drop-shadow-md transition-opacity duration-500 ${
          bolLoaded ? "opacity-100" : "opacity-0"
        }`}
      />

      {bolError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <svg
            className="w-10 h-10 opacity-30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>

          <span className="text-xs opacity-50">
            No se pudo cargar la imagen
          </span>
        </div>
      )}
    </div>
  );
}

function StepTag({ tag }: { tag: string }) {
  const bolOptional = tag === "Opcional";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
        bolOptional
          ? "bg-transparent text-muted-foreground border border-card-border"
          : "bg-transparent text-primary border border-primary/30"
      }`}
    >
      {tag}
    </span>
  );
}

function TipProBlock() {
  return (
    <div className="bg-secondary text-secondary-foreground rounded-[24px] p-6 flex items-start gap-4 w-full">
      <div className="bg-secondary-foreground/20 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 fill-secondary-foreground" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-secondary-foreground/90 mb-1.5">
          TIP PRO
        </p>

        <p className="text-[15px] leading-relaxed font-medium">
          Antes de publicar, revisa que tu inmueble tenga al menos 3 fotos claras, un título
          específico, una descripción útil y la ubicación correctamente definida.
        </p>
      </div>
    </div>
  );
}

function ActionButton({
  isLastStep,
  onNext,
}: {
  isLastStep: boolean;
  onNext: () => void;
}) {
  if (!isLastStep) {
    return (
      <button
        type="button"
        onClick={onNext}
        className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-primary text-primary-foreground text-[15px] font-bold hover:bg-primary/90 active:scale-[0.98] transition-all"
      >
        Ver siguiente paso

        <svg
          className="w-4 h-4 ml-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    );
  }

  return (
    <div className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-transparent border-2 border-primary text-primary text-[15px] font-bold">
      <svg
        className="w-5 h-5 text-secondary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M5 13l4 4L19 7"
        />
      </svg>

      ¡Guía completa! Ya estás listo para publicar.
    </div>
  );
}

//  Subcomponente: Tarjeta de paso

function StepCard({
  step,
  imageUrl,
  bolActive,
  bolCompleted,
  onSelect,
}: {
  step: Step;
  imageUrl: string;
  bolActive: boolean;
  bolCompleted: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`w-full transition-all duration-300 rounded-[24px] border overflow-hidden ${
        bolActive
          ? "bg-primary border-primary shadow-xl shadow-primary/20"
          : "bg-card-bg border-transparent cursor-pointer hover:border-card-border"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="w-full text-left p-5 sm:p-6 flex items-start gap-4"
      >
        {/* Número / check */}
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-base transition-colors ${
            bolActive
              ? "bg-primary-foreground/10 text-primary-foreground"
              : bolCompleted
              ? "bg-primary text-primary-foreground"
              : "bg-background text-primary"
          }`}
        >
          {bolCompleted && !bolActive ? (
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            step.number
          )}
        </div>

        {/* Texto */}
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <span
              className={`font-bold text-[17px] ${
                bolActive ? "text-primary-foreground" : "text-primary"
              }`}
            >
              {step.title}
            </span>

            {!bolActive && <StepTag tag={step.tag} />}
          </div>

          <p
            className={`text-[15px] ${
              bolActive ? "text-primary-foreground/70" : "text-muted-foreground"
            }`}
          >
            {step.description}
          </p>
        </div>

        {/* Flecha */}
        <div
          className={`flex-shrink-0 mt-3 transition-transform duration-300 ${
            bolActive ? "rotate-90" : ""
          }`}
        >
          <svg
            className={`w-5 h-5 ${
              bolActive ? "text-primary-foreground/40" : "text-muted"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </button>

      {bolActive && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="px-5 sm:px-6 pb-6">
            <div className="w-full h-[1px] bg-primary-foreground/10 mb-5" />

            <p className="text-[15px] text-primary-foreground/90 leading-relaxed mb-6">
              {step.detail}
            </p>
          </div>

          <div className="lg:hidden w-full bg-background border-t border-card-border">
            <div className="w-full px-4 py-3 bg-card-bg border-b border-card-border shadow-sm flex flex-col gap-1">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest block w-full">
                REFERENCIA VISUAL — PASO {step.number}
              </span>

              <span className="text-[10px] text-muted-foreground block w-full">
                {step.title}
              </span>
            </div>

            <div className="w-full bg-background overflow-hidden">
              <LazyImage
                src={imageUrl}
                alt={step.title}
                imageClassName="p-0"
                bolInline
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StepGallery({
  intActiveStep,
  onChangeStep,
}: {
  intActiveStep: number;
  onChangeStep: (n: number) => void;
}) {
  const [numTouchStart, setNumTouchStart] = useState<number | null>(null);
  const objImage = ARR_GALLERY[intActiveStep];

  useEffect(() => {
    const intNext = intActiveStep + 1;
    if (intNext >= ARR_GALLERY.length) return;

    const objImg = new window.Image();
    objImg.src = optimizeCloudinaryUrl(ARR_GALLERY[intNext].url);
  }, [intActiveStep]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setNumTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (numTouchStart === null) return;

    const diff = numTouchStart - e.changedTouches[0].clientX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) onChangeStep(Math.min(intActiveStep + 1, ARR_GALLERY.length - 1));
      else onChangeStep(Math.max(intActiveStep - 1, 0));
    }

    setNumTouchStart(null);
  };

  return (
    <div className="rounded-[24px] overflow-hidden border border-card-border bg-card-bg flex flex-col w-full shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between gap-2 bg-card-bg border-b border-card-border">
        <span className="text-[11px] font-bold text-primary uppercase tracking-widest truncate">
          REFERENCIA VISUAL — PASO {String(intActiveStep + 1).padStart(2, "0")}
        </span>

        <span className="text-[13px] text-muted-foreground shrink-0">
          {objImage.label}
        </span>
      </div>

      <div
        className="relative w-full aspect-[4/3] overflow-hidden group bg-background"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <LazyImage
          key={intActiveStep}
          src={objImage.url}
          alt={objImage.label}
          imageClassName="p-1 sm:p-2"
        />

        {/* Flechas */}
        {intActiveStep > 0 && (
          <button
            type="button"
            onClick={() => onChangeStep(intActiveStep - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md z-10"
            aria-label="Paso anterior"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {intActiveStep < ARR_GALLERY.length - 1 && (
          <button
            type="button"
            onClick={() => onChangeStep(intActiveStep + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md z-10"
            aria-label="Paso siguiente"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Dots */}
      <div className="px-6 py-4 flex items-center gap-2 border-t border-card-border bg-card-bg">
        <div className="flex gap-1.5">
          {ARR_GALLERY.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChangeStep(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                intActiveStep === idx ? "bg-primary w-6" : "bg-muted w-2 hover:bg-primary/40"
              }`}
              aria-label={`Ver ${img.label}`}
            />
          ))}
        </div>

        <span className="ml-auto text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          {intActiveStep + 1} DE {ARR_GALLERY.length}
        </span>
      </div>
    </div>
  );
}

//  Componente principal

export default function PublicarInmuebleGuide() {
  const [intActiveStep, setIntActiveStep] = useState<number>(0);

  const handleSelectStep = useCallback((intIndex: number) => {
    setIntActiveStep(intIndex);
  }, []);

  const handleNextStep = useCallback(() => {
    handleSelectStep(Math.min(intActiveStep + 1, ARR_STEPS.length - 1));
  }, [intActiveStep, handleSelectStep]);

  // Navegación por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setIntActiveStep((prev) => Math.min(prev + 1, ARR_STEPS.length - 1));
      } else if (e.key === "ArrowLeft") {
        setIntActiveStep((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="font-sans flex flex-col gap-8 max-w-[1200px] w-full">
      {/* Header con barra de progreso */}
      <div className="flex justify-between items-end border-b border-card-border pb-3 mb-2 relative">
        <span className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest">
          Progreso de la guía
        </span>

        <span className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest">
          {intActiveStep + 1} DE {ARR_STEPS.length} PASOS
        </span>

        <div className="absolute bottom-[-1px] left-0 h-[2px] w-32 bg-card-border">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${((intActiveStep + 1) / ARR_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Layout principal */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Columna izquierda: pasos */}
        <div className="lg:col-span-5 flex flex-col gap-4 lg:pb-40">
          {ARR_STEPS.map((step, idx) => (
            <StepCard
              key={step.number}
              step={step}
              imageUrl={ARR_GALLERY[idx].url}
              bolActive={intActiveStep === idx}
              bolCompleted={idx < intActiveStep}
              onSelect={() => handleSelectStep(idx)}
            />
          ))}

          {/* TipPro y botón en mobile */}
          <div className="flex flex-col gap-5 mt-4 lg:hidden">
            <TipProBlock />

            <ActionButton
              isLastStep={intActiveStep === ARR_STEPS.length - 1}
              onNext={handleNextStep}
            />
          </div>
        </div>

        {/* Columna derecha: galería sticky en desktop */}
        <div className="hidden lg:flex lg:col-span-7 flex-col gap-6 sticky top-32 h-fit">
          <StepGallery
            intActiveStep={intActiveStep}
            onChangeStep={handleSelectStep}
          />

          <TipProBlock />

          <ActionButton
            isLastStep={intActiveStep === ARR_STEPS.length - 1}
            onNext={handleNextStep}
          />
        </div>
      </div>
    </div>
  );
}