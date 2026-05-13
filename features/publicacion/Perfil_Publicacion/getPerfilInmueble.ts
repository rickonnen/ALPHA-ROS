/**
 * Dev: Gustavo Montaño
 * Date: 17/04/2026
 * Funcionalidad: Consulta principal a la base de datos para obtener el perfil completo
 *                de un inmueble. Extrae la información comercial, ubicación, detalles
 *                técnicos, recursos multimedia (imágenes/videos) y los datos de contacto
 *                directo del propietario.
 * @param intIdPublicacion - ID numérico exacto de la publicación que se desea consultar
 *                         en la tabla 'Publicacion'.
 * @return Objeto estructurado con todos los datos del inmueble, sus relaciones (Ubicación,
 *         Tipo, Multimedia) y el perfil del anunciante, o null si el ID es inválido o no existe.
 */
/**
 * Modificacion
 * Dev: Gustavo Montaño
 * Date: 17/04/2026
 * Funcionalidad: Extracción de los datos del creador de la publicación
 *                para poblar la tarjeta de contacto directo.
 * @param Usuario - Relación del ORM Prisma para acceder a la tabla del
 *                publicador y sus teléfonos vinculados.
 * @return Objeto con los campos nombres, apellidos, username, email,
 *                url_foto_perfil y el primer número de teléfono registrado.
 */
/**
 * Modificacion
 * Dev: Oliver Garcia
 * Date: 09/05/2026
 * Funcionalidad: Inclusión de PromocionPublicacion para detectar si la publicación
 *                tiene una promoción vigente (fecha_fin > now()). Solo se trae 1 registro
 *                activo; si el array viene con length > 0, la publicación está destacada.
 */
/**
 * Modificacion
 * @Dev: Gustavo Montaño
 * @Fecha: 09/05/2026
 * @Funcionalidad: Se integró la extracción del historial de rendimiento en el query principal.
 * Trae la relación 'EstadisticaPublicacion' ordenada cronológicamente de
 * forma ascendente para inyectarla en los componentes gráficos del frontend.
 */
import { prisma } from "@/lib/prisma";

export async function getPerfilInmueble(intIdPublicacion: number) {
  if (isNaN(intIdPublicacion)) return null;

  const objPerfilInmueble = await prisma.publicacion.findUnique({
    where: { id_publicacion: intIdPublicacion },
    select: {
      id_estado: true,
      id_usuario: true,
      titulo: true,
      descripcion: true,
      precio: true,
      superficie: true,
      Moneda: { select: { simbolo: true, nombre: true } },
      habitaciones: true,
      banos: true,
      garajes: true,
      plantas: true,
      TipoInmueble: { select: { nombre_inmueble: true } },
      TipoOperacion: { select: { nombre_operacion: true } },
      Ubicacion: {
        select: {
          direccion: true,
          zona: true,
          latitud: true,
          longitud: true,
          Ciudad: { select: { nombre_ciudad: true } },
        },
      },
      EstadoPublicacion: {
        select: { nombre_estado: true },
      },
      EstadoConstruccion: {
        select: { nombre_estado_construccion: true },
      },
      PublicacionCaracteristica: {
        select: {
          detalle_caracteristica: true,
          Caracteristica: {
            select: { nombre_caracteristica: true },
          },
        },
      },
      Video: { select: { url_video: true } },
      Imagen: { select: { url_imagen: true } },
      PuntoInteres: {
        select: {
          id_punto_interes: true,
          nombre: true,
          descripcion: true,
          latitud: true,
          longitud: true,
          distancia_metros: true,
          TipoPuntoInteres: {
            select: {
              nombre: true,
              icono: true,
              color: true,
            },
          },
        },
        orderBy: { orden: "asc" },
      },
      EstadisticaPublicacion: {
        select: {
          fecha: true,
          vistas: true,
          compartidas: true,
        },
        orderBy: {
          fecha: "asc",
        },
      },
      PromocionPublicacion: {
        where: {
          fecha_fin: { gt: new Date() },
        },
        select: { id_promocion: true },
        take: 1,
      },
      Usuario: {
        select: {
          id_usuario: true,
          nombres: true,
          apellidos: true,
          username: true,
          email: true,
          url_foto_perfil: true,
          direccion: true,
          UsuarioTelefono: {
            select: {
              Telefono: {
                select: {
                  codigo_pais: true,
                  nro_telefono: true,
                },
              },
            },
            take: 3,
          },
        },
      },
    },
  });

  return objPerfilInmueble;
}
