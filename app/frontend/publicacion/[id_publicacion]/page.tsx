/**
 * Dev: Gustavo Montaño
 * Date: 25/03/2026
 * Funcionalidad: Página del Perfil del Inmueble con datos reales de BD
 *                (HU4 - Tasks 4.1, 4.2, 4.3, 4.5, 4.8, 4.10, 4.13)
 * @param params - Parámetros de ruta dinámica con el ID de la publicación
 */
import { notFound } from "next/navigation";
import { Tag, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaGallery } from "@/app/frontend/publicacion/[id_publicacion]/components/MediaGallery";
import { PropertyDetails } from "@/app/frontend/publicacion/[id_publicacion]/components/PropertyDetails";
import { getPerfilInmueble } from "@/app/backend/publicacion/getPerfilInmueble";

export default async function PerfilInmueblePage({
  params,
}: {
  params: Promise<{ id_publicacion: string }>;
}) {
  const { id_publicacion } = await params;
  const objPerfil = await getPerfilInmueble(Number(id_publicacion));

  if (!objPerfil) return notFound();

  // Task 4.5: Extraer video ID según plataforma (YouTube, YouTube Shorts, Instagram Reel)
const strVideoUrl = objPerfil.Video?.[0]?.url_video ?? null;

const bolEsYoutube = strVideoUrl
  ? strVideoUrl.includes("youtube.com") || strVideoUrl.includes("youtu.be")
  : false;

const bolEsInstagram = strVideoUrl
  ? strVideoUrl.includes("instagram.com/reel") || strVideoUrl.includes("instagram.com/p")
  : false;

// Extraer ID de YouTube — soporta youtube.com/watch, youtu.be y youtube.com/shorts
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

  // Task 4.4: Mapear URLs reales desde modelo Imagen ← AQUÍ, antes del return
  const arrImagenes = objPerfil.Imagen?.map((img) => img.url_imagen ?? "") ?? [];
  return (
<main className="min-h-screen bg-[#F4EFE6] text-[#2E2E2E] p-4 md:p-12 overflow-x-hidden font-[family-name:var(--font-geist-sans)]">
        <div className="max-w-6xl mx-auto overflow-x-hidden">

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
            strTipoInmueble:  objPerfil.TipoInmueble?.nombre_inmueble  ?? "—",
            strTipoOperacion: objPerfil.TipoOperacion?.nombre_operacion ?? "—",
            strDepartamento:  objPerfil.Ubicacion?.Ciudad?.nombre_ciudad ?? "—",
            strZona:          objPerfil.Zona?.nombre_zona               ?? "—",
            intHabitaciones:  objPerfil.habitaciones                    ?? 0,
            intBanos:         objPerfil.banos                           ?? 0,
            intPlantas:       objPerfil.plantas                         ?? 0,
            intGarajes:       objPerfil.garajes                         ?? 0,
          }}
        />

        {/* Task 4.8: Descripción con saltos de línea */}
        <section className="mt-16 mb-20">
          <div className="bg-white/40 backdrop-blur-sm p-8 md:p-10 rounded-3xl shadow-sm border border-black/5">
            <h2 className="text-2xl font-bold mb-6 text-[#1F3A4D]">
              Descripción
            </h2>
            <p className="whitespace-pre-line text-lg leading-relaxed opacity-90">
              {objPerfil.descripcion}
            </p>
          </div>
        </section>

        {/* Task 4.10: Botones — rutas las conecta otro dev */}
<footer className="flex flex-row justify-between items-center gap-3 pt-10 border-t border-black/10">
  <Button
    variant="outline"
    className="flex-1 md:flex-none min-w-0 border-[#C26E5A] text-[#C26E5A] px-3 md:px-12 py-4 md:py-7 rounded-lg font-bold text-xs md:text-lg hover:bg-[#C26E5A]/5"
  >
    Ver mis publicaciones
  </Button>
  <Button
    className="flex-1 md:flex-none min-w-0 bg-[#C26E5A] text-white px-3 md:px-12 py-4 md:py-7 rounded-lg font-bold text-xs md:text-lg hover:bg-[#C26E5A]/90 transition-colors"
  >
    Publicar otro inmueble
  </Button>
</footer>

      </div>
    </main>
  );
}