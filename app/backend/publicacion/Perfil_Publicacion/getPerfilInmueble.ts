/**
 * Dev: Gustavo Montaño
 * Date: 25/03/2026
 * Funcionalidad: Consulta a la BD para obtener todos los datos del perfil
 *                del inmueble incluyendo relaciones (HU4 - Task 4.2)
 * @param intId - ID numérico de la publicación a consultar
 * @return Objeto con todos los datos del inmueble o null si no existe
 */
import { prisma } from "@/lib/prisma"; // 👈 Cambia esto para usar el singleton central

export async function getPerfilInmueble(intIdPublicacion: number) {
  // Verificación de seguridad
  if (isNaN(intIdPublicacion)) return null;

  const objPerfilInmueble = await prisma.publicacion.findUnique({
    where: { id_publicacion: intIdPublicacion },
    include: {
      TipoInmueble:  true,
      TipoOperacion: true,
      Ubicacion: {
        include: { Ciudad: true }
      },
      Zona:   true,
      Video:  true,
      Imagen: true,
    },
  });
  return objPerfilInmueble;
}