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
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { getPerfilInmueble } from "@/features/publicacion/Perfil_Publicacion/getPerfilInmueble";
import VistaInmuebleClient from "./VistaInmuebleClient";

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
  const hasValidMapCoordinates =
    typeof lat === "number" &&
    Number.isFinite(lat) &&
    typeof lng === "number" &&
    Number.isFinite(lng);
  const arrImagenes = objPerfil.Imagen?.map((img) => img.url_imagen ?? "") ?? [];
  const strEstado =
    objPerfil.EstadoPublicacion?.nombre_estado ??
    (objPerfil.id_estado == null || [0, 1, 2, 3].includes(objPerfil.id_estado) ? "Activa" : null);
  const bolDisponible = !["Pausada", "Eliminada", "Inactiva"].includes(strEstado ?? "");
  const puntosInteres = (objPerfil.PuntoInteres ?? [])
    .map((point) => ({
      id: point.id_punto_interes,
      nombre: point.nombre,
      descripcion: point.descripcion ?? null,
      lat: Number(point.latitud),
      lng: Number(point.longitud),
      distancia_metros: point.distancia_metros ?? null,
      tipo_nombre: point.TipoPuntoInteres?.nombre ?? null,
      tipo_color: point.TipoPuntoInteres?.color ?? null,
    }))
    .filter(
      (point) =>
        Number.isFinite(point.lat) &&
        Number.isFinite(point.lng),
    );

  const arrTelefonos =
    objPerfil.Usuario?.UsuarioTelefono?.map((ut) =>
      ut.Telefono ? `+${ut.Telefono.codigo_pais} ${ut.Telefono.nro_telefono}` : "",
    ).filter(Boolean) || [];

  return (
    <VistaInmuebleClient
      idPublicacion={intId}
      titulo={objPerfil.titulo ?? "Propiedad en venta"}
      estado={strEstado}
      disponible={bolDisponible}
      videoId={strVideoId ?? undefined}
      reelId={strReelId ?? undefined}
      imagenes={arrImagenes}
      precio={Number(objPerfil.precio)}
      monedaSimbolo={objPerfil.Moneda?.simbolo ?? null}
      superficie={Number(objPerfil.superficie)}
      direccion={strDireccion}
      lat={hasValidMapCoordinates ? lat : null}
      lng={hasValidMapCoordinates ? lng : null}
      puntosInteres={puntosInteres}
      descripcion={objPerfil.descripcion ?? ""}
      propietario={
        objPerfil.Usuario
          ? {
              id: objPerfil.Usuario.id_usuario,
              nombres: objPerfil.Usuario.nombres || "Usuario",
              apellidos: objPerfil.Usuario.apellidos || "",
              username: objPerfil.Usuario.username || "usuario",
              email: objPerfil.Usuario.email || "Correo no disponible",
              fotoUrl: objPerfil.Usuario.url_foto_perfil || null,
              telefonos: arrTelefonos,
              direccion:
                (objPerfil.Usuario as unknown as { direccion?: string }).direccion || null,
            }
          : null
      }
      detalles={{
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
  );
}
