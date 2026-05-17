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

import Link from "next/link";

import UserAvatar from "./UserAvatar";

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
    <main className="min-h-screen bg-background p-4 font-[family-name:var(--font-geist-sans)] text-foreground md:p-12">
      <ViewTracker id_publicacion={intId} />
      <PropertyDetailTracking id_publicacion={intId} />
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          {/* Mini-perfil del propietario → link a otroPerfil */}
          {objPerfil.Usuario && (
            <Link
              href={`/otroPerfil?id=${objPerfil.Usuario.id_usuario}`}
              className="inline-flex items-center gap-3 mb-6 group"
            >
              <UserAvatar
                src={objPerfil.Usuario.url_foto_perfil ?? ""}
                alt={objPerfil.Usuario.username ?? ""}
                className="w-10 h-10 rounded-full border-2 border-[#1F3A4D]/20 object-cover group-hover:border-[#C26E5A] transition-colors"
              />
              <span className="text-[#1F3A4D] font-semibold text-sm group-hover:text-[#C26E5A] transition-colors">
                @{`${objPerfil.Usuario.nombres} ${objPerfil.Usuario.apellidos}`.trim()
                  ? `${objPerfil.Usuario.nombres ?? ""} ${objPerfil.Usuario.apellidos ?? ""}`.trim()
                  : "Usuario"}
              </span>
            </Link>
          )}
          <h1 className="text-3xl md:text-5xl font-bold text-primary mb-4 tracking-tight break-words">
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

        {/* Task 4.3: Precio y Superficie */}
        <div className="flex flex-row justify-between items-center py-6 md:py-8 border-y border-black/10 mb-10 gap-2">
          <div className="flex items-start min-[540px]:items-center gap-1.5 md:gap-2 min-w-0">
            <Tag className="w-5 h-5 md:w-6 md:h-6 text-foreground opacity-70 shrink-0 mt-1 min-[540px]:mt-0" />
            <div className="flex flex-col min-[540px]:flex-row min-[540px]:items-center gap-x-1.5 text-[20px] min-[811px]:text-[24px]">
              <span className="font-bold text-primary">Precio:</span>
              <span className="font-medium whitespace-nowrap text-foreground">
                {objPerfil.Moneda?.simbolo === "B" ? "Bs." : objPerfil.Moneda?.simbolo || "Bs."}{" "}
                {Number(objPerfil.precio).toLocaleString("de-DE")}
              </span>
            </div>
          </div>
          <div className="flex items-start min-[540px]:items-center gap-1.5 md:gap-2 min-w-0">
            <Ruler className="w-5 h-5 md:w-6 md:h-6 text-foreground opacity-70 shrink-0 mt-1 min-[540px]:mt-0" />
            <div className="flex flex-col min-[540px]:flex-row min-[540px]:items-center gap-x-1.5 text-[20px] min-[811px]:text-[24px]">
              <span className="font-bold text-primary">Superficie:</span>
              <span className="font-medium whitespace-nowrap text-foreground">
                {Number(objPerfil.superficie).toLocaleString("de-DE")} m²
              </span>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <p className="text-xl mb-6">
            <span className="font-bold text-primary">Dirección:</span> {strDireccion}
          </p>
          {lat !== null && lng !== null ? (
            <LocationMapClient lat={lat} lng={lng} puntosInteres={puntosInteres} />
          ) : (
            <p className="text-sm italic text-muted-foreground">Ubicación exacta en el mapa no disponible.</p>
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

        {/* Task 4.8: Descripción */}
        <section className="mt-6 mb-6">
          <div className="bg-card-bg/40 backdrop-blur-sm p-8 md:p-10 rounded-3xl shadow-sm border border-card-border/20">
            <h2 className="text-2xl font-bold mb-6 text-primary border-b border-foreground/5 pb-2">
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

        {/* Botón Volver al final (Reemplaza a PropertyActions)*/}
        <div className="mt-12 flex items-center justify-between gap-4">
          <CloseTabButton className="px-10 py-3 border-2 border-secondary text-secondary rounded-xl font-bold hover:bg-secondary/10 transition-colors">
            Volver
          </CloseTabButton>
          <ReportModal id_publicacion={intId} />
        </div>
      </div>
    </main>
  );
}
