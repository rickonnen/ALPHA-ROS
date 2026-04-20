/**
 * @Dev: Gustavo Montaño
 * @Fecha: 18/04/2026
 * @Funcionalidad: Vista pública del inmueble (HU2). Renderiza dinámicamente la información 
 *                 de la propiedad, galería, mapa y contacto en una pestaña independiente.
 * @param {Promise<{ id_publicacion: string }>} params - Promesa con los parámetros de la 
 *                                                       ruta dinámica (Next.js App Router).
 * @param {string} params.id_publicacion - Identificador único de la publicación extraído 
 *                                         directamente desde la URL.
 * @return {JSX.Element} Interfaz completa de la vista del inmueble renderizada desde el servidor.
 */
import { notFound }          from "next/navigation";
import { Tag, Ruler }        from "lucide-react";    
import { MediaGallery }      from "@/features/publicacion/[id_publicacion]/components/MediaGallery";
import { PropertyDetails }   from "@/features/publicacion/[id_publicacion]/components/PropertyDetails";
import { getPerfilInmueble } from "@/features/publicacion/Perfil_Publicacion/getPerfilInmueble";
import { ContactCard }       from "@/features/publicacion/[id_publicacion]/components/ContactCard";
import { LocationMapClient } from "@/features/publicacion/[id_publicacion]/components/LocationMapClient";
import FavButton             from "@/components/ui/fav";
import { PublicationStatusBadge } from "@/features/publicacion/[id_publicacion]/components/PublicationStatusBadge";
import CloseTabButton from "./CloseTabButton";
export default async function VistaInmueblePage({
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
  const bolEsYoutube   = strVideoUrl ? strVideoUrl.includes("youtube.com") || strVideoUrl.includes("youtu.be") : false;
  const bolEsInstagram = strVideoUrl ? strVideoUrl.includes("instagram.com/reel") || strVideoUrl.includes("instagram.com/p") : false;
  
  const strVideoId = bolEsYoutube && strVideoUrl
    ? strVideoUrl.includes("youtu.be/") ? strVideoUrl.split("youtu.be/")[1]?.split("?")[0] : strVideoUrl.includes("/shorts/") ? strVideoUrl.split("/shorts/")[1]?.split("?")[0] : strVideoUrl.split("v=")[1]?.split("&")[0]
    : null;
    
  const strReelId = bolEsInstagram && strVideoUrl
    ? strVideoUrl.includes("/reel/") ? strVideoUrl.split("/reel/")[1]?.split("/")[0] : strVideoUrl.split("/p/")[1]?.split("/")[0]
    : null;

  // Task 4.8: Dirección desde relación Ubicacion
  const strDireccion = [
    objPerfil.Ubicacion?.direccion,
    objPerfil.Ubicacion?.zona,
  ].filter(Boolean).join(", ") || "Dirección no disponible";
  
  // Extraemos y convertimos a número las coordenadas (si existen)
  const lat = objPerfil.Ubicacion?.latitud ? Number(objPerfil.Ubicacion.latitud) : null;
  const lng = objPerfil.Ubicacion?.longitud ? Number(objPerfil.Ubicacion.longitud) : null;
  const arrImagenes = objPerfil.Imagen?.map((img) => img.url_imagen ?? "") ?? [];

  return (
    <main className="min-h-screen bg-[#F4EFE6] text-[#2E2E2E] p-4 md:p-12 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-6xl mx-auto">
        {/* Task 4.3: Título */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-5xl font-bold text-[#1F3A4D] mb-4 tracking-tight break-words">
            {objPerfil.titulo}
          </h1>
          <PublicationStatusBadge strEstado={objPerfil.EstadoPublicacion?.nombre_estado} />
        </header>

        {/* Task 4.4 + 4.5 + 4.11: Galería */}
        <div className="relative rounded-3xl overflow-hidden">
          <MediaGallery
            id_publicacion={intId.toString()}
            arrImagenes={arrImagenes}
            strVideoId={strVideoId ?? undefined}
            strReelId={strReelId ?? undefined}
            mostrarFav={false}
          />         
          {/* BOTÓN SUPERPUESTO (Solo visible en HU2) */}
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
                {Number(objPerfil.precio).toLocaleString("de-DE")} {objPerfil.Moneda?.simbolo === "B" ? "Bs." : (objPerfil.Moneda?.simbolo || "Bs.")}
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

        {/* Task 4.8: Dirección y Mapa */}
        <div className="mb-12">
          <p className="text-xl mb-6">
            <span className="font-bold text-[#1F3A4D]">Dirección:</span> {strDireccion}
          </p>
          {lat !== null && lng !== null ? (
            <LocationMapClient lat={lat} lng={lng} />
          ) : (
            <p className="text-sm italic text-gray-500">Ubicación exacta en el mapa no disponible.</p>
          )}
        </div>

        {/* Task 4.6 + 4.7: Detalles */}
        <PropertyDetails
          objInfo={{
            strTipoInmueble:       objPerfil.TipoInmueble?.nombre_inmueble         ?? "—",
            strTipoOperacion:      objPerfil.TipoOperacion?.nombre_operacion       ?? "—",
            strDepartamento:       objPerfil.Ubicacion?.Ciudad?.nombre_ciudad      ?? "—",
            strZona:               objPerfil.Ubicacion?.zona                       ?? "—",
            strEstadoConstruccion: objPerfil.EstadoConstruccion?.nombre_estado_construccion  ?? "—",
            intHabitaciones:       objPerfil.habitaciones                          ?? 0,
            intBanos:              objPerfil.banos                                 ?? 0,
            intPlantas:            objPerfil.plantas                               ?? 0,
            intGarajes:            objPerfil.garajes                               ?? 0,
            arrCaracteristicas:    (objPerfil.PublicacionCaracteristica ?? []).map((item) => ({
              strNombre:  item.Caracteristica.nombre_caracteristica ?? "",
              strDetalle: item.detalle_caracteristica ?? null,
            })),
          }}
        />

        {/* Task 4.8: Descripción */}
        <section className="mt-6 mb-6">
          <div className="bg-white/40 backdrop-blur-sm p-8 md:p-10 rounded-3xl shadow-sm border border-black/5">
            <h2 className="text-2xl font-bold mb-6 text-[#1F3A4D] border-b border-[#2E2E2E]/5 pb-2">
              Descripción
            </h2>
            <p className="whitespace-pre-line text-base leading-relaxed opacity-90 break-words">
              {objPerfil.descripcion}
            </p>
          </div>
        </section>

        {/* ContactCard */}
        {(() => {
          const arrTelefonos = objPerfil.Usuario?.UsuarioTelefono?.map(
            (ut) => ut.Telefono ? `+${ut.Telefono.codigo_pais} ${ut.Telefono.nro_telefono}` : ""
          ).filter(Boolean) || [];
          return objPerfil.Usuario && (
            <ContactCard 
              strTituloInmueble={objPerfil.titulo || "Inmueble"}
              objPropietario={{
                strNombres: objPerfil.Usuario.nombres || "Usuario",
                strApellidos: objPerfil.Usuario.apellidos || "",
                strUsername: objPerfil.Usuario.username || "usuario",
                strEmail: objPerfil.Usuario.email || "Correo no disponible",
                strFotoUrl: objPerfil.Usuario.url_foto_perfil || null,
                arrTelefonos: arrTelefonos, 
                strDireccion: (objPerfil.Usuario as unknown as { direccion?: string }).direccion || null,
              }} 
            />
          );
        })()}

        {/* Botón Volver al final (Reemplaza a PropertyActions)*/}
        <div className="mt-12 flex justify-start">
          <CloseTabButton className="px-10 py-3 border-2 border-[#C26E5A] text-[#C26E5A] rounded-xl font-bold hover:bg-[#C26E5A]/10 transition-colors">
            Volver
          </CloseTabButton>
        </div>

      </div>
    </main>
  );
}