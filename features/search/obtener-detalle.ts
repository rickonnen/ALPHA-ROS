/**
 * @Dev: [Equipo]
 * @Fecha: 2026-04-07
 * @Descripción: Servicio para obtener detalle de publicación de BD
 * Se usa dentro de search, no toca publicación
 */

import { prisma } from "@/lib/prisma";
import { PublicacionDetalleBusqueda } from "./search-services";

/**
 * Obtiene datos completos de una publicación incluyendo relaciones
 * @param idPublicacion - ID de la publicación
 * @returns Publicación con todos sus datos y relaciones
 */
export async function obtenerDetallePublicacion(
  idPublicacion: number
): Promise<PublicacionDetalleBusqueda | null> {
  try {
    const publicacion = await prisma.publicacion.findUnique({
      where: { id_publicacion: idPublicacion },
      include: {
        Imagen: {
          select: { url_imagen: true },
        },
        Ubicacion: {
          include: {
            Ciudad: { select: { nombre_ciudad: true } },
            Pais: { select: { nombre_pais: true } },
          },
        },
        TipoInmueble: { select: { nombre_inmueble: true } },
        TipoOperacion: { select: { nombre_operacion: true } },
        EstadoConstruccion: { select: { nombre_estado_construccion: true } },
        Moneda: { select: { nombre: true, simbolo: true, tasa_cambio: true } },
        Usuario: {
          select: {
            nombres: true,
            apellidos: true,
            email: true,
            url_foto_perfil: true,
            username: true,
            UsuarioTelefono: {
              include: { Telefono: { select: { nro_telefono: true } } },
            },
          },
        },
        PublicacionCaracteristica: {
          include: {
            Caracteristica: { select: { nombre_caracteristica: true } },
          },
        },
      },
    });

    if (!publicacion) return null;

    // Obtener teléfono del usuario
    let telefonoUsuario: string | undefined;
    if (
      publicacion.Usuario?.UsuarioTelefono &&
      publicacion.Usuario.UsuarioTelefono.length > 0
    ) {
      telefonoUsuario = publicacion.Usuario.UsuarioTelefono[0]?.Telefono?.nro_telefono ?? undefined;
    }

    // Mapear respuesta
    const resultado: PublicacionDetalleBusqueda = {
      id_publicacion: publicacion.id_publicacion,
      titulo: publicacion.titulo ?? undefined,
      descripcion: publicacion.descripcion ?? undefined,
      precio: publicacion.precio ? Number(publicacion.precio) : undefined,
      superficie: publicacion.superficie ? Number(publicacion.superficie) : undefined,
      habitaciones: publicacion.habitaciones ?? undefined,
      banos: publicacion.banos ?? undefined,
      garajes: publicacion.garajes ?? undefined,
      plantas: publicacion.plantas ?? undefined,
      tipo_inmueble: publicacion.TipoInmueble?.nombre_inmueble ?? undefined,
      tipo_operacion: publicacion.TipoOperacion?.nombre_operacion ?? undefined,
      estado_construccion: publicacion.EstadoConstruccion?.nombre_estado_construccion ?? undefined,
      moneda: publicacion.Moneda
        ? {
            nombre: publicacion.Moneda.nombre ?? undefined,
            simbolo: publicacion.Moneda.simbolo ?? undefined,
            tasa_cambio: publicacion.Moneda.tasa_cambio
              ? Number(publicacion.Moneda.tasa_cambio)
              : undefined,
          }
        : undefined,
      ubicacion: publicacion.Ubicacion
        ? {
            direccion: publicacion.Ubicacion.direccion ?? undefined,
            zona: publicacion.Ubicacion.zona ?? undefined,
            ciudad: publicacion.Ubicacion.Ciudad?.nombre_ciudad ?? undefined,
            pais: publicacion.Ubicacion.Pais?.nombre_pais ?? undefined,
            latitud: publicacion.Ubicacion.latitud
              ? Number(publicacion.Ubicacion.latitud)
              : undefined,
            longitud: publicacion.Ubicacion.longitud
              ? Number(publicacion.Ubicacion.longitud)
              : undefined,
          }
        : undefined,
      imagenes:
        publicacion.Imagen && publicacion.Imagen.length > 0
          ? publicacion.Imagen.map((img) => ({
              url_imagen: img.url_imagen ?? undefined,
            }))
          : undefined,
      caracteristicas:
        publicacion.PublicacionCaracteristica && publicacion.PublicacionCaracteristica.length > 0
          ? publicacion.PublicacionCaracteristica.map((pc) => ({
              nombre_caracteristica: pc.Caracteristica?.nombre_caracteristica ?? undefined,
            }))
          : undefined,
      usuario: publicacion.Usuario
        ? {
            nombres: publicacion.Usuario.nombres ?? undefined,
            apellidos: publicacion.Usuario.apellidos ?? undefined,
            email: publicacion.Usuario.email ?? undefined,
            telefono: telefonoUsuario,
            url_foto_perfil: publicacion.Usuario.url_foto_perfil ?? undefined,
            username: publicacion.Usuario.username ?? undefined,
          }
        : undefined,
    };

    return resultado;
  } catch (error) {
    console.error(`Error obteniendo detalle publicación ${idPublicacion}:`, error);
    throw error;
  }
}
