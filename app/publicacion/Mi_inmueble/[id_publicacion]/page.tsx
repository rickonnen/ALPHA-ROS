/**
 * @Dev: Gustavo Montaño
 * @Fecha: 18/04/2026
 * @Funcionalidad: Perfil privado del inmueble, renderiza dinámicamente los detalles de la propiedad para el propietario,
 *                 integrando los botones de gestión y deshabilitando funciones de explorador.
 * @param {Promise<{ id_publicacion: string }>} params - Promesa con los parámetros de la ruta dinámica.
 * @param {string} params.id_publicacion - Identificador único de la publicación extraído desde la URL.
 * @return {JSX.Element} Interfaz completa de la vista privada del inmueble renderizada desde el servidor.
 */
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { getServerSession } from "next-auth";
import { Tag, Ruler } from "lucide-react";
import { MediaGallery } from "@/features/publicacion/[id_publicacion]/components/MediaGallery";
import { PropertyDetails } from "@/features/publicacion/[id_publicacion]/components/PropertyDetails";
import { getPerfilInmueble } from "@/features/publicacion/Perfil_Publicacion/getPerfilInmueble";
import { PropertyActions } from "@/features/publicacion/[id_publicacion]/components/PropertyActions";
import { ContactCard } from "@/features/publicacion/[id_publicacion]/components/ContactCard";
import { LocationMapClient } from "@/features/publicacion/[id_publicacion]/components/LocationMapClient";
import {
  PublicationStatusBadge,
  DestacadaBadge,
} from "@/features/publicacion/[id_publicacion]/components/PublicationStatusBadge";
import { ReferencePointsSection } from "@/features/publicacion/[id_publicacion]/components/ReferencePointsSection";
import { EstadisticasInmueble } from "@/features/publicacion/[id_publicacion]/components/EstadisticasInmueble";

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
    <main className="min-h-screen bg-[#F4EFE6] p-4 font-[family-name:var(--font-geist-sans)] text-[#2E2E2E] md:p-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <h1 className="mb-4 break-words text-3xl font-bold tracking-tight text-[#1F3A4D] md:text-5xl">
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

        <div className="mb-10 flex flex-row items-center justify-between gap-2 border-y border-black/10 py-6 md:py-8">
          <div className="flex min-w-0 items-start gap-1.5 md:gap-2 min-[540px]:items-center">
            <Tag className="mt-1 h-5 w-5 shrink-0 text-[#2E2E2E] opacity-70 min-[540px]:mt-0 md:h-6 md:w-6" />
            <div className="flex flex-col gap-x-1.5 text-subtitle min-[540px]:flex-row min-[540px]:items-center min-[811px]:text-[24px]">
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

        <section className="mb-8 mt-8">
          <EstadisticasInmueble estadisticas={objPerfil.EstadisticaPublicacion ?? []} />
        </section>

        <PropertyActions />
      </div>
    </main>
  );
}
