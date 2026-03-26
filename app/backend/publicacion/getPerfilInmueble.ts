/**
 * Dev: Gustavo Montaño
 * Date: 25/03/2026
 * Funcionalidad: Obtener todos los datos del perfil del inmueble por ID (HU4 - Task 4.2)
 * @param intIdPublicacion - ID de la publicación desde la ruta dinámica [id]
 * @return Objeto completo del perfil del inmueble con sus relaciones o null si no existe
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getPerfilInmueble(intIdPublicacion: number) {
  const objPerfilInmueble = await prisma.publicacion.findUnique({
    where: { id_publicacion: intIdPublicacion },
    include: {
      TipoInmueble:  true,
      TipoOperacion: true,
      Ubicacion:     {
        include: {
          Ciudad: true,
        }
      },
      Zona:          true,
      Video:         true,
      Imagen:        true,
    },
  });
  return objPerfilInmueble;
}