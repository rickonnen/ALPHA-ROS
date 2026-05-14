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
/**
 * Dev: Gustavo Montaño
 * Fecha: 25/04/2026
 * Update: Fix Modificación de "Compra" a "Venta" en frontend antes de pasar a PropertyDetails.
 * @param {Promise<{ id_publicacion: string }>} params - Promesa con el ID dinámico de la URL.
 * @return {JSX.Element} Interfaz completa pública del inmueble.
 */
import { notFound } from "next/navigation";
import { Tag, Ruler } from "lucide-react";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { MediaGallery } from "@/features/publicacion/[id_publicacion]/components/MediaGallery";
import { PropertyDetails } from "@/features/publicacion/[id_publicacion]/components/PropertyDetails";
import { getPerfilInmueble } from "@/features/publicacion/Perfil_Publicacion/getPerfilInmueble";
import { ContactCard } from "@/features/publicacion/[id_publicacion]/components/ContactCard";
import { LocationMapClient } from "@/features/publicacion/[id_publicacion]/components/LocationMapClient";
import { PropertyDetailTracking } from "@/features/publicacion/[id_publicacion]/components/PropertyDetailTracking";
import { PublicationStatusBadge } from "@/features/publicacion/[id_publicacion]/components/PublicationStatusBadge";
import { ReferencePointsSection } from "@/features/publicacion/[id_publicacion]/components/ReferencePointsSection";
import { ViewTracker } from "@/features/publicacion/[id_publicacion]/components/ViewTracker";
import ReportModal from "@/features/publicacion/[id_publicacion]/components/ReportModal";
import FavButton from "@/components/ui/fav";
import CloseTabButton from "./CloseTabButton";

export default async function VistaInmueblePage({
  params,
}: {
  params: Promise<{ id_publicacion: string }>;
}) {
  const { id_publicacion } = await params;
  const intId = parseInt(id_publicacion, 10);
  if (isNaN(intId)) return notFound();

  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;
    if (authToken) {
      const decoded = verify(authToken, process.env.JWT_SECRET!) as { userId: string };
      if (decoded?.userId) {
        await fetch(`${process.env.NEXTAUTH_URL}/api/perfil/addHistorial`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_usuario: decoded.userId,
            id_publicacion: intId,
          }),
        });
      }
    }
  } catch {
    // Si falla el registro no interrumpe la vista
  }

  const objPerfil = await getPerfilInmueble(intId);
  if (!objPerfil) return notFound();

  const strVideoUrl = objPerfil.Video?.[0]?.url_video ?? null;
  const bolEsYoutube = strVideoUrl
    ? strVideoUrl.includes("youtube.com") || strVideoUrl.includes("youtu.be")
    : false;
  const bolEsInstagram = strVideoUrl
    ? strVideoUrl.includes("instagram.com/reel") || strVideoUrl.includes("instagram.com/p")
    : false;

  const strVideoId =
    bolEsYoutube && strVideoUrl
      ? strVideoUrl.includes("youtu.be/")
        ? strVideoUrl.split("youtu.be/")[1]?.split("?")[0]
        : strVideoUrl.includes("/shorts/")
          ? strVideoUrl.split("/shorts/")[1]?.split("?")[0]
          : strVideoUrl.split("v=")[1]?.split("&")[0]
      : null;

  const strReelId =
    bolEsInstagram && strVideoUrl
      ? strVideoUrl.includes("/reel/")
        ? strVideoUrl.split("/reel/")[1]?.split("/")[0]
        : strVideoUrl.split("/p/")[1]?.split("/")[0]
      : null;

  const strDireccion =
    [objPerfil.Ubicacion?.direccion, objPerfil.Ubicacion?.zona].filter(Boolean).join(", ") ||
    "Dirección no disponible";

  const lat = objPerfil.Ubicacion?.latitud ? Number(objPerfil.Ubicacion.latitud) : null;
  const lng = objPerfil.Ubicacion?.longitud ? Number(objPerfil.Ubicacion.longitud) : null;
  const arrImagenes = objPerfil.Imagen?.map((img) => img.url_imagen ?? "") ?? [];
  const strEstado =
    objPerfil.EstadoPublicacion?.nombre_estado ??
    (objPerfil.id_estado == null || [0, 1, 2, 3].includes(objPerfil.id_estado) ? "Activa" : null);
  const bolDisponible = !["Pausada", "Eliminada", "Inactiva"].includes(strEstado ?? "");
  const puntosInteres = (objPerfil.PuntoInteres ?? []).map((point) => ({
    id: point.id_punto_interes,
    nombre: point.nombre,
    descripcion: point.descripcion ?? null,
    lat: Number(point.latitud),
    lng: Number(point.longitud),
    distancia_metros: point.distancia_metros ?? null,
    tipo_nombre: point.TipoPuntoInteres?.nombre ?? null,
    tipo_color: point.TipoPuntoInteres?.color ?? null,
  }));

  return (
    <main className="min-h-screen bg-[#F4EFE6] p-4 font-[family-name:var(--font-geist-sans)] text-[#2E2E2E] md:p-12">
      <ViewTracker id_publicacion={intId} />
      <PropertyDetailTracking id_publicacion={intId} />
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <h1 className="mb-4 break-words text-3xl font-bold tracking-tight text-[#1F3A4D] md:text-5xl">
            {objPerfil.titulo}
          </h1>
          <PublicationStatusBadge strEstado={strEstado} />
        </header>

        <div className="relative overflow-hidden rounded-3xl">
          <MediaGallery
            id_publicacion={intId.toString()}
            arrImagenes={arrImagenes}
            strVideoId={strVideoId ?? undefined}
            strReelId={strReelId ?? undefined}
            mostrarFav={false}
            mostrarShare={true}
            tituloShare={objPerfil.titulo ?? "Propiedad en venta"}
            disponible={bolDisponible}
          />
          <div className="absolute bottom-14 right-8 z-20">
            <FavButton id_publicacion={intId.toString()} />
          </div>
        </div>

        <div className="mb-10 flex flex-row items-center justify-between gap-2 border-y border-black/10 py-6 md:py-8">
          <div className="flex min-w-0 items-start gap-1.5 md:gap-2 min-[540px]:items-center">
            <Tag className="mt-1 h-5 w-5 shrink-0 text-[#2E2E2E] opacity-70 min-[540px]:mt-0 md:h-6 md:w-6" />
            <div className="flex flex-col gap-x-1.5 text-[20px] min-[540px]:flex-row min-[540px]:items-center min-[811px]:text-[24px]">
              <span className="font-bold text-[#1F3A4D]">Precio:</span>
              <span className="whitespace-nowrap font-medium text-[#2E2E2E]">
                {objPerfil.Moneda?.simbolo === "B" ? "Bs." : objPerfil.Moneda?.simbolo || "Bs."}{" "}
                {Number(objPerfil.precio).toLocaleString("de-DE")}
              </span>
            </div>
          </div>
          <div className="flex min-w-0 items-start gap-1.5 md:gap-2 min-[540px]:items-center">
            <Ruler className="mt-1 h-5 w-5 shrink-0 text-[#2E2E2E] opacity-70 min-[540px]:mt-0 md:h-6 md:w-6" />
            <div className="flex flex-col gap-x-1.5 text-[20px] min-[540px]:flex-row min-[540px]:items-center min-[811px]:text-[24px]">
              <span className="font-bold text-[#1F3A4D]">Superficie:</span>
              <span className="whitespace-nowrap font-medium text-[#2E2E2E]">
                {Number(objPerfil.superficie).toLocaleString("de-DE")} m²
              </span>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <p className="mb-6 text-xl">
            <span className="font-bold text-[#1F3A4D]">Dirección:</span> {strDireccion}
          </p>
          {lat !== null && lng !== null ? (
            <LocationMapClient lat={lat} lng={lng} puntosInteres={puntosInteres} />
          ) : (
            <p className="text-sm italic text-gray-500">Ubicación exacta en el mapa no disponible.</p>
          )}
        </div>

        <PropertyDetails
          objInfo={{
            strTipoInmueble: objPerfil.TipoInmueble?.nombre_inmueble ?? "—",
            strTipoOperacion:
              objPerfil.TipoOperacion?.nombre_operacion === "Compra"
                ? "Venta"
                : objPerfil.TipoOperacion?.nombre_operacion ?? "—",
            strDepartamento: objPerfil.Ubicacion?.Ciudad?.nombre_ciudad ?? "—",
            strZona: objPerfil.Ubicacion?.zona ?? "—",
            strEstadoConstruccion:
              objPerfil.EstadoConstruccion?.nombre_estado_construccion ?? "—",
            intHabitaciones: objPerfil.habitaciones ?? 0,
            intBanos: objPerfil.banos ?? 0,
            intPlantas: objPerfil.plantas ?? 0,
            intGarajes: objPerfil.garajes ?? 0,
            arrCaracteristicas: (objPerfil.PublicacionCaracteristica ?? []).map((item) => ({
              strNombre: item.Caracteristica.nombre_caracteristica ?? "",
              strDetalle: item.detalle_caracteristica ?? null,
            })),
          }}
        />
        <ReferencePointsSection puntosInteres={puntosInteres} />

        <section className="mb-6 mt-6">
          <div className="rounded-3xl border border-black/5 bg-white/40 p-8 shadow-sm backdrop-blur-sm md:p-10">
            <h2 className="mb-6 border-b border-[#2E2E2E]/5 pb-2 text-2xl font-bold text-[#1F3A4D]">
              Descripción
            </h2>
            <p className="whitespace-pre-line break-words text-base leading-relaxed opacity-90">
              {objPerfil.descripcion}
            </p>
          </div>
        </section>

        {(() => {
          const arrTelefonos =
            objPerfil.Usuario?.UsuarioTelefono?.map((ut) =>
              ut.Telefono ? `+${ut.Telefono.codigo_pais} ${ut.Telefono.nro_telefono}` : "",
            ).filter(Boolean) || [];

          return objPerfil.Usuario ? (
            <ContactCard
              id_publicacion={intId}
              strTituloInmueble={objPerfil.titulo || "Inmueble"}
              objPropietario={{
                strNombres: objPerfil.Usuario.nombres || "Usuario",
                strApellidos: objPerfil.Usuario.apellidos || "",
                strUsername: objPerfil.Usuario.username || "usuario",
                strEmail: objPerfil.Usuario.email || "Correo no disponible",
                strFotoUrl: objPerfil.Usuario.url_foto_perfil || null,
                arrTelefonos,
                strDireccion:
                  (objPerfil.Usuario as unknown as { direccion?: string }).direccion || null,
              }}
            />
          ) : null;
        })()}

        <div className="mt-12 flex items-center justify-between gap-4">
          <CloseTabButton className="rounded-xl border-2 border-[#C26E5A] px-10 py-3 font-bold text-[#C26E5A] transition-colors hover:bg-[#C26E5A]/10">
            Volver
          </CloseTabButton>
          <ReportModal id_publicacion={intId} />
        </div>
      </div>
    </main>
  );
}
