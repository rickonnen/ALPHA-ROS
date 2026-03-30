/**
 * @Dev: Gustavo Montaño
 * @Fecha: 28/03/2026
 * @Modificación: StefanyS — 29/03/2026
 * @Funcionalidad: Página del Perfil del Inmueble. Pasa strUserId a PropertyActions
 *                 para que la verificación del contador ocurra solo al hacer click.
 * @param params - Parámetros de ruta dinámica con el ID de la publicación.
 * @return {JSX.Element} Vista completa del perfil del inmueble.
 */

import { notFound }          from "next/navigation";
import { Tag, Ruler }        from "lucide-react";
import { MediaGallery }      from "@/app/frontend/publicacion/[id_publicacion]/components/MediaGallery";
import { PropertyDetails }   from "@/app/frontend/publicacion/[id_publicacion]/components/PropertyDetails";
import { getPerfilInmueble } from "@/app/backend/publicacion/Perfil_Publicacion/getPerfilInmueble";
import { PropertyActions }   from "@/app/frontend/publicacion/[id_publicacion]/components/PropertyActions";

export default async function PerfilInmueblePage({
  params,
}: {
  params: Promise<{ id_publicacion: string }>;
}) {
  // 1. Esperamos los parámetros
  const { id_publicacion } = await params;

  // 2. Convertimos a número de forma segura
  const intId = parseInt(id_publicacion, 10);

  // 3. Si no es número válido → 404
  if (isNaN(intId)) return notFound();

  // 4. Consultar datos de la publicación
  const objPerfil = await getPerfilInmueble(intId);
  if (!objPerfil) return notFound();

  // 5. ID del usuario dueño de esta publicación
  //    TODO: reemplazar por usuario autenticado desde sesión cuando esté disponible
  const strUserId = objPerfil.id_usuario ?? "";

  // Task 4.5: Extraer video ID según plataforma
  const strVideoUrl    = objPerfil.Video?.[0]?.url_video ?? null;
  const bolEsYoutube   = strVideoUrl
    ? strVideoUrl.includes("youtube.com") || strVideoUrl.includes("youtu.be")
    : false;
  const bolEsInstagram = strVideoUrl
    ? strVideoUrl.includes("instagram.com/reel") || strVideoUrl.includes("instagram.com/p")
    : false;

  const strVideoId = bolEsYoutube && strVideoUrl
    ? strVideoUrl.includes("youtu.be/")
      ? strVideoUrl.split("youtu.be/")[1]?.split("?")[0]
      : strVideoUrl.includes("/shorts/")
        ? strVideoUrl.split("/shorts/")[1]?.split("?")[0]
        : strVideoUrl.split("v=")[1]?.split("&")[0]
    : null;

  const strReelId = bolEsInstagram && strVideoUrl
    ? strVideoUrl.includes("/reel/")
      ? strVideoUrl.split("/reel/")[1]?.split("/")[0]
      : strVideoUrl.split("/p/")[1]?.split("/")[0]
    : null;

  // Task 4.8: Dirección desde relación Ubicacion
  const strDireccion = objPerfil.Ubicacion?.direccion ?? "Dirección no disponible";

  // Task 4.4: URLs de imágenes
  const arrImagenes = objPerfil.Imagen?.map((img) => img.url_imagen ?? "") ?? [];

  return (
    <main className="min-h-screen bg-[#F4EFE6] text-[#2E2E2E] p-4 md:p-12 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-6xl mx-auto">

        {/* Task 4.3: Título */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-5xl font-bold text-[#1F3A4D] mb-4 tracking-tight">
            {objPerfil.titulo}
          </h1>
        </header>

        {/* Task 4.4 + 4.5 + 4.11: Galería */}
        <MediaGallery
          arrImagenes={arrImagenes}
          strVideoId={strVideoId ?? undefined}
          strReelId={strReelId ?? undefined}
        />

        {/* Task 4.3: Precio y Superficie */}
        <div className="flex flex-row justify-between items-center py-8 border-y border-black/10 mb-10 gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <Tag className="w-5 h-5 md:w-6 md:h-6 text-[#2E2E2E] opacity-70 shrink-0" />
            <p className="text-base md:text-3xl">
              <span className="font-bold text-[#1F3A4D]">Precio:</span>{" "}
              <span className="font-medium">
                {Number(objPerfil.precio).toLocaleString("de-DE")} $
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <Ruler className="w-5 h-5 md:w-6 md:h-6 text-[#2E2E2E] opacity-70 shrink-0" />
            <p className="text-base md:text-3xl">
              <span className="font-bold text-[#1F3A4D]">Superficie:</span>{" "}
              <span className="font-medium">
                {Number(objPerfil.superficie)} m²
              </span>
            </p>
          </div>
        </div>

        {/* Task 4.8: Dirección */}
        <div className="mb-12 text-xl">
          <p>
            <span className="font-bold text-[#1F3A4D]">Dirección:</span> {strDireccion}
          </p>
        </div>

        {/* Task 4.6 + 4.7: Detalles */}
        <PropertyDetails
          objInfo={{
            strTipoInmueble:  objPerfil.TipoInmueble?.nombre_inmueble   ?? "—",
            strTipoOperacion: objPerfil.TipoOperacion?.nombre_operacion  ?? "—",
            strDepartamento:  objPerfil.Ubicacion?.Ciudad?.nombre_ciudad ?? "—",
            strZona:          objPerfil.Zona?.nombre_zona                ?? "—",
            intHabitaciones:  objPerfil.habitaciones                     ?? 0,
            intBanos:         objPerfil.banos                            ?? 0,
            intPlantas:       objPerfil.plantas                          ?? 0,
            intGarajes:       objPerfil.garajes                          ?? 0,
          }}
        />

        {/* Task 4.8: Descripción */}
        <section className="mt-16 mb-20">
          <div className="bg-white/40 backdrop-blur-sm p-8 md:p-10 rounded-3xl shadow-sm border border-black/5">
            <h2 className="text-2xl font-bold mb-6 text-[#1F3A4D]">
              Descripción
            </h2>
            <p className="whitespace-pre-line text-base leading-relaxed opacity-90">
              {objPerfil.descripcion}
            </p>
          </div>
        </section>

        {/* Task 4.10: Botones — verificación ocurre al hacer click en PropertyActions */}
        <PropertyActions strUserId={strUserId} />

      </div>
    </main>
  );
}