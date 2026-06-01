"use client";
/**
 * Dev: Dylan Coca Beltran - xdev/sow-dylanc
 * Fecha: 26/04/2026
 * Fix: Reemplazo de colores hardcodeados por variables CSS del sistema para soporte de modo oscuro:
 *      bg-[#E7E1D7] → bg-secondary-fund, bg-[#F8F5EF] → bg-card-bg,
 *      bg-[#E5DED2]/bg-[#E9E2D8]/bg-[#ECE6DD]/bg-[#EFE9E0] → bg-muted,
 *      border-[#DDD4C8]/border-[#D8CFC2]/border-[#E2D6C8]/border-[#E2D9CD]/border-[#D9D0C4] → border-card-border,
 *      text-[#1F2D3D]/text-[#1E1E1E] → text-foreground,
 *      text-[#77716B]/text-[#756D65] → text-muted-foreground,
 *      text-[#C26E5A]/text-[#B76857] → text-secondary,
 *      bg-[#C26E5A] → bg-secondary, border-[#C26E5A]/border-[#CDAA9F] → border-secondary,
 *      hover:bg-[#AF604E] → hover:bg-secondary/80, disabled:bg-[#D8B9AF] → disabled:bg-secondary/40,
 *      text-white (sobre secondary) → text-secondary-foreground
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bath,
  BedDouble,
  BriefcaseBusiness,
  Building2,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  DollarSign,
  FileText,
  House,
  LandPlot,
  Layers,
  MapPin,
  MapPinned,
  PencilLine,
  Play,
  PlugZap,
  Ruler,
  Video,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/auth/AuthContext";
import {
  PUBLICACION_FORM_ROUTE,
  PUBLICACION_REQUISITOS_SESSION_KEY,
  REQUISITOS_ESPECIFICOS,
  REQUISITOS_GENERALES,
  TipoInmueble,
  TIPOS_INMUEBLE,
} from "./requisitos.constants";

const DEFAULT_GUIA_VIDEO_URL = "https://youtu.be/o7BLVyPD0hk?si=cWfQioPVZhAguEPz";

const TIPO_INMUEBLE_ICONS: Record<TipoInmueble, LucideIcon> = {
  Casa: House,
  Departamento: Building2,
  Terreno: LandPlot,
  Oficina: BriefcaseBusiness,
};

const REQUISITO_ICONS: Record<TipoInmueble, LucideIcon[]> = {
  Casa: [FileText, Ruler, BedDouble, ClipboardCheck],
  Departamento: [FileText, Ruler, Bath, Layers],
  Terreno: [FileText, LandPlot, MapPinned, PlugZap],
  Oficina: [FileText, Ruler, BriefcaseBusiness, ClipboardCheck],
};

function normalizeGuideVideoUrl(strUrl?: string): string | null {
  const strValue = strUrl?.trim();
  if (!strValue) return null;

  try {
    const objUrl = new URL(strValue);
    const strHost = objUrl.hostname.replace(/^www\./, "");

    if (strHost === "youtu.be") {
      const strVideoId = objUrl.pathname.split("/").filter(Boolean)[0];
      return strVideoId ? `https://www.youtube.com/embed/${strVideoId}` : null;
    }

    if (strHost.endsWith("youtube.com") || strHost.endsWith("youtube-nocookie.com")) {
      if (objUrl.pathname.startsWith("/embed/")) {
        return `https://www.youtube.com${objUrl.pathname}`;
      }

      const strVideoId = objUrl.searchParams.get("v");
      if (strVideoId) {
        return `https://www.youtube.com/embed/${strVideoId}`;
      }
    }
  } catch {
    return strValue;
  }

  return strValue;
}

function getRequirementIcon(strTipo: TipoInmueble, intIndex: number) {
  return REQUISITO_ICONS[strTipo][intIndex] ?? PencilLine;
}

export default function RequisitosPublicacionPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [strTipoSeleccionado, setStrTipoSeleccionado] = useState<TipoInmueble | null>(null);
  const [bolConfirmado, setBolConfirmado] = useState(false);
  const [bolMostrarVideo, setBolMostrarVideo] = useState(false);
  const [bolMostrarFallbackGuia, setBolMostrarFallbackGuia] = useState(false);

  const strVideoUrl = normalizeGuideVideoUrl(
    process.env.NEXT_PUBLIC_PUBLICACION_GUIA_VIDEO_URL || DEFAULT_GUIA_VIDEO_URL,
  );
  const strVideoPlaybackUrl = strVideoUrl
    ? `${strVideoUrl}${strVideoUrl.includes("?") ? "&" : "?"}autoplay=1`
    : null;

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push("/");
      return;
    }

    sessionStorage.removeItem(PUBLICACION_REQUISITOS_SESSION_KEY);
  }, [isLoading, router, user]);

  const handleConfirmar = (value: boolean | "indeterminate") => {
    const bolValue = Boolean(value);
    setBolConfirmado(bolValue);

    if (bolValue) {
      sessionStorage.setItem(PUBLICACION_REQUISITOS_SESSION_KEY, "1");
    } else {
      sessionStorage.removeItem(PUBLICACION_REQUISITOS_SESSION_KEY);
    }
  };

  const handleContinuar = () => {
    if (!bolConfirmado) return;
    sessionStorage.setItem(PUBLICACION_REQUISITOS_SESSION_KEY, "1");
    router.push(PUBLICACION_FORM_ROUTE);
  };

  const handlePlayGuiaRapida = () => {
    if (strVideoUrl) {
      setBolMostrarVideo(true);
      setBolMostrarFallbackGuia(false);
      return;
    }

    setBolMostrarFallbackGuia(true);
  };

  if (isLoading || !user) {
    return (
      <section className="min-h-[70vh] bg-secondary-fund px-4 py-8 sm:px-6 md:py-10">
        <div className="mx-auto w-full max-w-5xl animate-pulse rounded-lg border border-card-border bg-card-bg p-6">
          <div className="h-9 w-3/4 rounded-md bg-muted" />
          <div className="mt-6 h-64 rounded-md bg-muted" />
        </div>
      </section>
    );
  }

  const arrEspecificos = strTipoSeleccionado ? REQUISITOS_ESPECIFICOS[strTipoSeleccionado] : [];

  return (
    <main className="min-h-screen bg-secondary-fund px-4 py-8 text-foreground sm:px-6 md:py-10">
      <section className="mx-auto w-full max-w-5xl">
        <h1 className="mb-6 text-center text-3xl font-bold leading-tight sm:text-4xl">
          ¿Qué necesitas tener en cuenta para publicar tu inmueble?
        </h1>

        <div className="rounded-lg border border-card-border bg-card-bg p-4 shadow-sm sm:p-6">
          <div className="grid gap-5 md:grid-cols-[1.1fr_1fr]">
            <article className="rounded-lg bg-muted p-4 text-center">
              {bolMostrarVideo && strVideoPlaybackUrl ? (
                <iframe
                  title="Guía rápida para publicar tu propiedad"
                  src={strVideoPlaybackUrl}
                  className="h-52 w-full rounded-lg border border-card-border bg-muted sm:h-64"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <button
                  type="button"
                  onClick={handlePlayGuiaRapida}
                  className="flex h-52 w-full flex-col items-center justify-center rounded-lg border border-[#D8CFC2] bg-[#E5DED2] transition-colors hover:bg-[#DED6CA] sm:h-64"
                  aria-label="Reproducir guía rápida"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-card-bg/85">
                    <Play className="h-8 w-8 text-secondary" />
                  </div>
                </button>
              )}
              {bolMostrarFallbackGuia && !strVideoUrl && (
                <p className="mt-3 rounded-md bg-[#F5EDE4] px-3 py-2 text-sm font-medium text-[#6B5F57]">
                  Aun no hay un video de guía configurado. Puedes continuar revisando los requisitos aquí mismo.
                </p>
              )}
              <h2 className="mt-4 text-xl font-bold">Guía rápida para publicar tu propiedad</h2>
              <p className="mt-1 text-base font-semibold text-muted-foreground">Ver video Explicativo</p>
            </article>

            <article className="space-y-4">
              <h2 className="text-center text-2xl font-bold">Selecciona tu tipo de inmueble</h2>
              <div className="mx-auto grid max-w-xs grid-cols-2 gap-2">
                {TIPOS_INMUEBLE.map((strTipo) => {
                  const bolActive = strTipoSeleccionado === strTipo;
                  const TipoIcon = TIPO_INMUEBLE_ICONS[strTipo];
                  return (
                    <button
                      key={strTipo}
                      type="button"
                      onClick={() => setStrTipoSeleccionado(strTipo)}
                      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-colors sm:text-base ${
                        bolActive
                          ? "border-secondary bg-secondary text-secondary-foreground"
                          : "border-secondary/50 bg-muted text-secondary hover:bg-muted/80"
                      }`}
                    >
                      <TipoIcon className="h-4 w-4 flex-shrink-0" />
                      {strTipo}
                    </button>
                  );
                })}
              </div>

              <div className="min-h-48 rounded-lg border border-card-border bg-muted p-4">
                {!strTipoSeleccionado ? (
                  <p className="grid h-full min-h-36 place-items-center text-center text-lg font-semibold text-muted-foreground">
                    &quot;Selecciona el tipo de inmueble para ver las características correspondientes&quot;
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {arrEspecificos.map((strRequisito, intIndex) => {
                      const Icon = getRequirementIcon(strTipoSeleccionado, intIndex);
                      return (
                        <li key={strRequisito} className="flex items-start gap-2 text-base text-foreground">
                          <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary" />
                          <span>{strRequisito}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </article>
          </div>

          <div className="my-5 border-t border-card-border" />

          <section>
            <h2 className="text-2xl font-semibold">Requisitos Generales para Cualquier Inmueble</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {REQUISITOS_GENERALES.map((strItem, intIndex) => {
                const Icon = [Camera, MapPin, DollarSign, Video][intIndex] ?? CheckCircle2;
                return (
                  <li
                    key={strItem}
                    className="flex min-h-16 items-start gap-2 rounded-lg border border-card-border bg-muted px-3 py-3 text-base text-foreground"
                  >
                    <Icon className="mt-1 h-4 w-4 flex-shrink-0 text-secondary" />
                    <span>{strItem}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="my-5 border-t border-card-border" />

          <div className="space-y-3">
            <label
              htmlFor="confirmar-requisitos"
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-secondary bg-card-bg p-3 text-base text-foreground"
            >
              <Checkbox
                id="confirmar-requisitos"
                checked={bolConfirmado}
                onCheckedChange={handleConfirmar}
                className="mt-0.5 border-secondary data-checked:border-secondary data-checked:bg-secondary"
              />
              <span>Sí, entiendo qué necesito para añadir mi propiedad y tengo todo listo</span>
            </label>

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleContinuar}
                disabled={!bolConfirmado}
                className="h-10 rounded-lg bg-secondary px-6 font-semibold text-secondary-foreground hover:bg-secondary/80 disabled:cursor-not-allowed disabled:bg-secondary/40"
              >
                Empezar a publicar
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}