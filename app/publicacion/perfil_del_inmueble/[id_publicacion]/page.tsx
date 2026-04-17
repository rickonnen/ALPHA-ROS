
/**
 * @Dev: Gustavo Montaño
 * @Fecha: 07/04/2026
 * @Funcionalidad: Página del Perfil del Inmueble.
 * @param params - Parámetros de ruta dinámica con el ID de la publicación.
 * @return {JSX.Element} Vista completa del perfil del inmueble.
 */
import { notFound }          from "next/navigation";
import { Tag, Ruler }        from "lucide-react";
import { MediaGallery }      from "@/features/publicacion/[id_publicacion]/components/MediaGallery";
import { PropertyDetails }   from "@/features/publicacion/[id_publicacion]/components/PropertyDetails";
import { getPerfilInmueble } from "@/features/publicacion/Perfil_Publicacion/getPerfilInmueble";
import { PropertyActions }   from "@/features/publicacion/[id_publicacion]/components/PropertyActions";
import FavButton from "@/components/ui/fav";

export default async function PerfilInmueblePage({
  params,
}: {
  params: Promise<{ id_publicacion: string }>;
}) {
  const { id_publicacion } = await params;
  const intId = parseInt(id_publicacion, 10);
  if (isNaN(intId)) return notFound();
  const objPerfil = await getPerfilInmueble(intId);
  if (!objPerfil) return notFound();

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
  const strDireccion = [
  objPerfil.Ubicacion?.direccion,
  objPerfil.Ubicacion?.zona,
].filter(Boolean).join(", ") || "Dirección no disponible";
  
  const arrImagenes = objPerfil.Imagen?.map((img) => img.url_imagen ?? "") ?? [];
  return (
    <main className="min-h-screen bg-[#F4EFE6] text-[#2E2E2E] p-4 md:p-12 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-6xl mx-auto">

        {/* Task 4.3: Título */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-5xl font-bold text-[#1F3A4D] mb-4 tracking-tight break-words">
            {objPerfil.titulo}
          </h1>
        </header>
        {/* Task 4.4 + 4.5 + 4.11: Galería */}
        <div className="relative group rounded-3xl overflow-hidden">
          <MediaGallery
            arrImagenes={arrImagenes}
            strVideoId={strVideoId ?? undefined}
            strReelId={strReelId ?? undefined}
          />
          
          {/* BOTÓN SUPERPUESTO: Esquina inferior derecha */}
          <div className="absolute bottom-14 right-8 z-20">
            <FavButton id_publicacion={intId.toString()} />
          </div>
        </div>
        {/* Task 4.3: Precio y Superficie */}
        <div className="flex flex-row justify-between items-center py-6 md:py-8 border-y border-black/10 mb-10 gap-2">
          {/* Bloque Precio */}
          <div className="flex items-start min-[540px]:items-center gap-1.5 md:gap-2 min-w-0">
            <Tag className="w-5 h-5 md:w-6 md:h-6 text-[#2E2E2E] opacity-70 shrink-0 mt-1 min-[540px]:mt-0" />
            <div className="flex flex-col min-[540px]:flex-row min-[540px]:items-center gap-x-1.5 text-[20px] min-[811px]:text-[24px]">
              <span className="font-bold text-[#1F3A4D]">Precio:</span>
              <span className="font-medium whitespace-nowrap text-[#2E2E2E]">
                {Number(objPerfil.precio).toLocaleString("de-DE")} Bs.
              </span>
            </div>
          </div>
          {/* Bloque Superficie */}
          <div className="flex items-start min-[540px]:items-center gap-1.5 md:gap-2 min-w-0">
            <Ruler className="w-5 h-5 md:w-6 md:h-6 text-[#2E2E2E] opacity-70 shrink-0 mt-1 min-[540px]:mt-0" />
            <div className="flex flex-col min-[540px]:flex-row min-[540px]:items-center gap-x-1.5 text-[20px] min-[811px]:text-[24px]">
              <span className="font-bold text-[#1F3A4D]">Superficie:</span>
              <span className="font-medium whitespace-nowrap text-[#2E2E2E]">
                {Number(objPerfil.superficie).toLocaleString("de-DE")} m²
              </span>
            </div>
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
            strZona:          objPerfil.Ubicacion?.zona ?? "—",
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
            <p className="whitespace-pre-line text-base leading-relaxed opacity-90 break-words">
              {objPerfil.descripcion}
            </p>
          </div>
        </section>
        {/* Task 4.10: Botones — verificación ocurre al hacer click en PropertyActions */}
        <PropertyActions />

      </div>
    </main>
  );
}