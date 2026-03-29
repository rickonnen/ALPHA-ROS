import { PrismaClient } from "@prisma/client";
import { PublicacionCreateInput } from "./publicacion.dto";

const prisma = new PrismaClient();

export interface PublicacionCreadaResult {
  id_publicacion: number;
}

export async function crearInformacionComercial(
  input: PublicacionCreateInput
): Promise<PublicacionCreadaResult> {
  const publicacion = await prisma.publicacion.create({
    data: {
      titulo:            input.titulo,
      descripcion:       input.descripcion,
      precio:            input.precio,
      id_tipo_inmueble:  input.id_tipo_inmueble,
      id_tipo_operacion: input.id_tipo_operacion,
      // id_estado:      input.id_estado,
      // id_usuario:     input.id_usuario, // requiere UUID válido en tabla Usuario
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