"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, DollarSign, FileText, House, MapPin, PencilLine, Play, Ruler, Video } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/frontend/auth/AuthContext";
import {
  LOGIN_ROUTE,
  PUBLICACION_FORM_ROUTE,
  PUBLICACION_REQUISITOS_SESSION_KEY,
  REQUISITOS_ESPECIFICOS,
  REQUISITOS_GENERALES,
  TipoInmueble,
  TIPOS_INMUEBLE,
} from "./requisitos.constants";

function getRequirementIcon(strItem: string) {
  if (strItem.startsWith("Título")) return FileText;
  if (strItem.startsWith("Superficie")) return Ruler;
  if (strItem.startsWith("N° de habitaciones")) return House;
  if (strItem.startsWith("Piso de Oficina")) return House;
  return PencilLine;
}

export default function RequisitosPublicacionPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [strTipoSeleccionado, setStrTipoSeleccionado] = useState<TipoInmueble | null>(null);
  const [bolConfirmado, setBolConfirmado] = useState(false);

  const strVideoUrl = "https://www.youtube.com/embed/f_WuRfuMXQw"; //cambiar por el video real

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push(LOGIN_ROUTE);
      return;
    }
    sessionStorage.removeItem(PUBLICACION_REQUISITOS_SESSION_KEY);
  }, [isLoading, router, user]);

  const handleContinuar = () => {
    if (!bolConfirmado) return;
    sessionStorage.setItem(PUBLICACION_REQUISITOS_SESSION_KEY, "1");
    router.push(PUBLICACION_FORM_ROUTE);
  };

  if (isLoading || !user) {
    return (
      <section className="min-h-[70vh] bg-[#E7E1D7] px-4 py-8 sm:px-6 md:py-10">
        <div className="mx-auto w-full max-w-5xl animate-pulse rounded-2xl border border-[#DDD4C8] bg-[#F8F5EF] p-6">
          <div className="h-9 w-3/4 rounded-md bg-[#E5DED2]" />
        </div>
      </section>
    );
  }

  const arrEspecificos = strTipoSeleccionado ? REQUISITOS_ESPECIFICOS[strTipoSeleccionado] : [];

  return (
    <section className="min-h-screen bg-[#E7E1D7] px-4 py-8 sm:px-6 md:py-10">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="text-3xl font-bold text-[#1F2D3D] sm:text-4xl">
          ¿Qué necesitas tener en cuenta para publicar tu inmueble?
        </h1>

        <div className="mt-6 rounded-2xl border border-[#DDD4C8] bg-[#F8F5EF] p-4 shadow-sm sm:p-6">
          <div className="grid gap-4 md:grid-cols-[1.1fr_1fr]">
            <article className="rounded-xl bg-[#E5DED2] p-4">
              {strVideoUrl ? (
                <iframe
                  title="Guía rápida para publicar tu propiedad"
                  src={strVideoUrl}
                  className="h-52 w-full rounded-lg border border-[#D8CFC2] bg-[#E5DED2] sm:h-64"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-52 w-full flex-col items-center justify-center rounded-lg border border-[#D8CFC2] bg-[#E5DED2] text-center sm:h-64">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/85">
                    <Play className="h-8 w-8 text-[#C26E5A]" />
                  </div>
                </div>
              )}
              <h2 className="mt-4 text-xl font-bold text-[#1F2D3D]">Guía rápida para publicar tu propiedad</h2>
              <p className="mt-1 text-base font-semibold text-[#77716B]">Ver video Explicativo</p>
            </article>

            <article className="space-y-4">
              <h3 className="text-2xl font-bold text-[#1F2D3D]">Selecciona tu tipo de inmueble</h3>
              <div className="grid grid-cols-2 gap-2">
                {TIPOS_INMUEBLE.map((strTipo) => {
                  const bolActive = strTipoSeleccionado === strTipo;
                  return (
                    <button
                      key={strTipo}
                      type="button"
                      onClick={() => setStrTipoSeleccionado(strTipo)}
                      className={`rounded-full border px-3 py-2 text-sm font-semibold transition-colors sm:text-base ${
                        bolActive
                          ? "border-[#C26E5A] bg-[#C26E5A] text-white"
                          : "border-[#CDAA9F] bg-[#EFE9E0] text-[#B76857] hover:bg-[#E8DED0]"
                      }`}
                    >
                      {strTipo}
                    </button>
                  );
                })}
              </div>

              <div className="min-h-48 rounded-xl border border-[#E2D6C8] bg-[#E9E2D8] p-4">
                {!strTipoSeleccionado ? (
                  <p className="grid h-full place-items-center text-center text-lg font-semibold text-[#8A8178]">
                    Selecciona el tipo de inmueble para ver las características correspondientes
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {arrEspecificos.map((strRequisito) => {
                      const Icon = getRequirementIcon(strRequisito);
                      return (
                        <li key={strRequisito} className="flex items-start gap-2 text-base text-[#1E1E1E]">
                          <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C26E5A]" />
                          <span>{strRequisito}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </article>
          </div>

          <div className="my-5 border-t border-[#D9D0C4]" />

          <section>
            <h3 className="text-2xl font-semibold text-[#1F2D3D]">Requisitos Generales para Cualquier Inmueble</h3>
            <ul className="mt-3 space-y-2">
              {REQUISITOS_GENERALES.map((strItem, intIndex) => {
                const Icon = [Camera, MapPin, DollarSign, Video][intIndex];
                return (
                  <li
                    key={strItem}
                    className="flex items-center gap-2 rounded-md border border-[#E2D9CD] bg-[#ECE6DD] px-3 py-2 text-base text-[#1E1E1E]"
                  >
                    <Icon className="h-4 w-4 flex-shrink-0 text-[#C26E5A]" />
                    <span>{strItem}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="my-5 border-t border-[#D9D0C4]" />

          <div className="space-y-3">
            <label
              htmlFor="confirmar-requisitos"
              className="flex cursor-pointer items-start gap-3 rounded-md border border-[#C26E5A] bg-[#F5EDE4] p-3 text-base text-[#1E1E1E]"
            >
              <Checkbox
                id="confirmar-requisitos"
                checked={bolConfirmado}
                onCheckedChange={(value) => setBolConfirmado(Boolean(value))}
                className="mt-0.5 border-[#C26E5A] data-checked:border-[#C26E5A] data-checked:bg-[#C26E5A]"
              />
              <span>Sí, entiendo qué necesito para añadir mi propiedad y tengo todo listo</span>
            </label>

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleContinuar}
                disabled={!bolConfirmado}
                className="h-10 rounded-md bg-[#C26E5A] px-6 font-semibold text-white hover:bg-[#AF604E] disabled:cursor-not-allowed disabled:bg-[#D8B9AF]"
              >
                Continuar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
