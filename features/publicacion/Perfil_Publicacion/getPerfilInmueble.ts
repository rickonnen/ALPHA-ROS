/**
 * Dev: Gustavo Montaño
 * Date: 25/03/2026
 * Funcionalidad: Consulta a la BD para obtener todos los datos del perfil
 *                del inmueble incluyendo relaciones (HU4 - Task 4.2)
 * @param intIdPublicacion - ID numérico de la publicación a consultar
 * @return Objeto con todos los datos del inmueble o null si no existe
 */
import { prisma } from "@/lib/prisma";

export async function getPerfilInmueble(intIdPublicacion: number) {
  // Verificación de seguridad
  if (isNaN(intIdPublicacion)) return null;

  const objPerfilInmueble = await prisma.publicacion.findUnique({
    where: { id_publicacion: intIdPublicacion },
    select: {
      titulo:       true,
      descripcion:  true,
      precio:       true,
      superficie:   true,
      habitaciones: true,
      banos:        true,
      garajes:      true,
      plantas:      true,
      TipoInmueble:  { select: { nombre_inmueble:  true } },
      TipoOperacion: { select: { nombre_operacion: true } },
      Ubicacion: {
        select: {
          direccion: true,
          zona:      true,
          Ciudad:    { select: { nombre_ciudad: true } },
        },
      },
      Zona:   { select: { nombre_zona: true } },
      Video:  { select: { url_video:   true } },
      Imagen: { select: { url_imagen:  true } },
    },
  });
  return objPerfilInmueble;
}