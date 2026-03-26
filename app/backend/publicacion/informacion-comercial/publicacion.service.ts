import { PrismaClient } from "@prisma/client";
import { PublicacionCreateInput } from "./publicacion.dto";

const prisma = new PrismaClient();

export interface PublicacionCreadaResult {
  id_publicacion: number;
}

export async function crearInformacionComercial(
  input: PublicacionCreateInput
): Promise<PublicacionCreadaResult> {
  // Calcular siguiente ID manualmente (id_publicacion no tiene autoincrement)
  const ultimo = await prisma.publicacion.findFirst({
    orderBy: { id_publicacion: "desc" },
    select: { id_publicacion: true },
  });
  const nuevoId = (ultimo?.id_publicacion ?? 0) + 1;

  const publicacion = await prisma.publicacion.create({
    data: {
      id_publicacion: nuevoId,
      titulo:         input.titulo,
      descripcion:    input.descripcion,
      precio:         input.precio,
      // FK opcionales — se conectan cuando tengamos los IDs reales de la BD
       id_tipo_inmueble:  input.id_tipo_inmueble,
       id_tipo_operacion: input.id_tipo_operacion,
      // id_estado:         input.id_estado,
      // id_usuario:        input.id_usuario,  // requiere UUID válido en tabla Usuario
    },
    select: {
      id_publicacion: true,
    },
  });

  return {
    id_publicacion: publicacion.id_publicacion,
  };
}

export async function obtenerPublicacionPorId(id: number) {
  return prisma.publicacion.findUnique({
    where: { id_publicacion: id },
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