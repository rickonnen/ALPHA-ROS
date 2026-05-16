/**
 * @Dev: Gustavo Montaño
 * @Fecha: 18/04/2026
 * @Funcionalidad: Perfil privado del inmueble, renderiza dinámicamente los detalles de la propiedad para el propietario,
 *                 integrando los botones de gestión y deshabilitando funciones de explorador.
 * @param {Promise<{ id_publicacion: string }>} params - Promesa con los parámetros de la ruta dinámica.
 * @param {string} params.id_publicacion - Identificador único de la publicación extraído desde la URL.
 * @return {JSX.Element} Interfaz completa de la vista privada del inmueble renderizada desde el servidor.
 */
/**
  * @Modificacion
  * @Dev: Gustavo Montaño
  * @Fecha: 18/04/2026
  * @Funcionalidad: Capa de autorización del lado del servidor. Verifica la identidad 
  *                 del usuario actual (ya sea mediante JWT por correo o sesión de Google) 
  *                 y la compara con el propietario original del inmueble. Evita vulnerabilidades 
  *                 tipo IDOR redirigiendo a intrusos a la vista pública.
  * @param {string | undefined} token - Token de sesión JWT extraído directamente de las cookies.
  * @param {Session | null} session - Sesión de NextAuth generada a través del proveedor de Google.
  * @param {Object} objPerfil.Usuario - Datos del dueño de la propiedad consultados previamente en la BD.
  * @return {void | never} Lanza un 'redirect' (Next.js) hacia la ruta pública si falla la validación, 
  *                        o permite continuar con el renderizado si el usuario es el dueño legítimo.
*/
/**
 * Dev: Gustavo Montaño
 * Fecha: 25/04/2026
 * Update: Fix Modificación de "Compra" a "Venta" en frontend antes de pasar a PropertyDetails.
 * @param {Promise<{ id_publicacion: string }>} params - Promesa con el ID dinámico de la URL.
 * @return {JSX.Element} Interfaz completa privada del inmueble.
 */
/**
 * Modificacion
 * Dev: Oliver Garcia
 * Fecha: 09/05/2026
 * Update: Agrega etiqueta "Propiedad Destacada" en el header cuando la publicación
 *         tiene una PromocionPublicacion vigente (fecha_fin > now()). Solo visible
 *         para el propietario en esta vista privada.
 */
/**
 * Modificacion
 * @Dev: Gustavo Montaño
 * @Fecha: 09/05/2026
 * @Funcionalidad: Se integró el componente <EstadisticasInmueble /> dentro de la vista.
 * El componente se sitúa antes de los botones de acción, pasando los datos 
 * del historial de rendimiento recuperados directamente desde el backend.
 */
/**
 * Modificacion
 * @Dev: Marcela C.
 * @Fecha: 10/05/2026
 * @Funcionalidad: Corrección de posición del símbolo de moneda (Bs.) 
 *                 para que aparezca delante del número, no detrás.
 */
/**
 * Modificacion
 * @Dev: Gabriel Paredes
 * @Fecha: 10/05/2026
 * @Funcionalidad: Se habilita mostrarShare={true} en <MediaGallery /> para mostrar
 *   el botón de compartir sobre la galería. Se pasan tituloShare y disponible.
 *   mostrarFav se mantiene en false (vista privada del propietario).
 */
/*
 * Dev: Dylan Coca Beltran - xdev/sow-dylanc
 * Fecha: 26/04/2026
 * Fix: Reemplazo de colores hardcodeados por variables CSS del sistema para soporte de modo oscuro:
 *      bg-[#F4EFE6] → bg-background, text-[#2E2E2E] → text-foreground,
 *      text-[#1F3A4D] → text-primary, bg-white/40 → bg-card-bg/40,
 *      border-black/5 → border-card-border/20, text-gray-500 → text-muted-foreground
 */

import { notFound, redirect }     from "next/navigation";
import { cookies }                from "next/headers";
import { verify }                 from "jsonwebtoken";
import { getServerSession }       from "next-auth";
import { Tag, Ruler }             from "lucide-react";
import { MediaGallery }           from "@/features/publicacion/[id_publicacion]/components/MediaGallery";
import { PropertyDetails }        from "@/features/publicacion/[id_publicacion]/components/PropertyDetails";
import { getPerfilInmueble }      from "@/features/publicacion/Perfil_Publicacion/getPerfilInmueble";
import { PropertyActions }        from "@/features/publicacion/[id_publicacion]/components/PropertyActions";
import { ContactCard }            from "@/features/publicacion/[id_publicacion]/components/ContactCard";
import { LocationMapClient }      from "@/features/publicacion/[id_publicacion]/components/LocationMapClient";
import { PublicationStatusBadge, DestacadaBadge } from "@/features/publicacion/[id_publicacion]/components/PublicationStatusBadge";
import { EstadisticasInmueble } from "@/features/publicacion/[id_publicacion]/components/EstadisticasInmueble";

import { ReferencePointsSection } from "@/features/publicacion/[id_publicacion]/components/ReferencePointsSection";

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

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const session = await getServerSession();

  let idUsuarioActual: string | null = null;
  let emailUsuarioActual: string | null = null;

  if (token) {
    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as {
        userId?: string;
        id?: string;
        sub?: string;
      };
      idUsuarioActual = decoded.userId || decoded.id || decoded.sub || null;
    } catch (error) {
      console.error(">>>> ERROR JWT:", error);
    }
  }

  if (!idUsuarioActual && session?.user) {
    idUsuarioActual = (session.user as { id?: string }).id || null;
    emailUsuarioActual = session.user.email || null;
  }

  const idPropietarioInmueble = objPerfil.Usuario?.id_usuario;
  const emailPropietarioInmueble = objPerfil.Usuario?.email;
  const bolEsDueno =
    (idUsuarioActual && String(idUsuarioActual) === String(idPropietarioInmueble)) ||
    (emailUsuarioActual && emailUsuarioActual === emailPropietarioInmueble);

  if (!bolEsDueno) {
    redirect(`/publicacion/Vista_del_Inmueble/${intId}`);
  }

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
  const bolEsDestacada = (objPerfil.PromocionPublicacion?.length ?? 0) > 0;
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
    <main className="min-h-screen bg-background text-foreground p-4 md:p-12 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl md:text-5xl font-bold text-primary mb-4 tracking-tight break-words">
            {objPerfil.titulo}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <PublicationStatusBadge strEstado={strEstado} />
            {bolEsDestacada && <DestacadaBadge />}
          </div>
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
        </div>

        {/* Task 4.3: Precio y Superficie */}
        <div className="flex flex-row justify-between items-center py-6 md:py-8 border-y border-black/10 mb-10 gap-2">
          <div className="flex items-start min-[540px]:items-center gap-1.5 md:gap-2 min-w-0">
            <Tag className="w-5 h-5 md:w-6 md:h-6 text-foreground opacity-70 shrink-0 mt-1 min-[540px]:mt-0" />
            <div className="flex flex-col min-[540px]:flex-row min-[540px]:items-center gap-x-1.5 text-subtitle min-[811px]:text-[24px]">
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

        <section className="mb-8 mt-8">
          <EstadisticasInmueble estadisticas={objPerfil.EstadisticaPublicacion ?? []} />
        </section>

        <PropertyActions />
      </div>
    </main>
  );
}
