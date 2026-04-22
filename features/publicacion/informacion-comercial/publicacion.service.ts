/**
 * @Dev: [BenjaminA]
 * @Fecha: 28/03/2026
 * @Funcionalidad: Servicio de acceso a datos para el módulo de publicación.
 * Contiene las operaciones Prisma para crear y consultar publicaciones
 * de inmuebles en la base de datos.
 */

import { PrismaClient } from "@prisma/client";
import { PublicacionCreateInput } from "./publicacion.dto";

const prisma = new PrismaClient();

// Resultado retornado tras crear una publicación
export interface PublicacionCreadaResult {
  id_publicacion: number;
}

/**
 * @Funcionalidad: Crea el registro de información comercial de un inmueble en la BD
 * @param {PublicacionCreateInput} input - Datos validados y mapeados del formulario
 * @return {PublicacionCreadaResult} ID de la publicación creada
 */
export async function crearInformacionComercial(
  input: PublicacionCreateInput
): Promise<PublicacionCreadaResult> {
  const objPublicacion = await prisma.publicacion.create({
    data: {
      titulo:            input.titulo,
      descripcion:       input.descripcion,
      precio:            input.precio,
      id_tipo_inmueble:  input.id_tipo_inmueble,
      id_tipo_operacion: input.id_tipo_operacion,
      // id_estado:      input.id_estado,   // pendiente tabla EstadoPublicacion
      // id_usuario:     input.id_usuario,  // pendiente middleware de auth
    },
    select: {
      id_publicacion: true,
    },
  });

  return {
    id_publicacion: objPublicacion.id_publicacion,
  };
}

/**
 * @Funcionalidad: Obtiene una publicación por su ID para verificar datos guardados
 * @param {number} intId - ID de la publicación a consultar
 * @return {object | null} Datos de la publicación o null si no existe
 */
export async function obtenerPublicacionPorId(intId: number) {
  return prisma.publicacion.findUnique({
    where: { id_publicacion: intId },
    select: {
      id_publicacion:    true,
      titulo:            true,
      precio:            true,
      descripcion:       true,
      id_tipo_inmueble:  true,
      id_tipo_operacion: true,
      id_estado:         true,
      id_usuario:        true,
    },
  });
}