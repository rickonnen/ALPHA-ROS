"use server";

/**
 * @Dev: jimmyP
 * @Fecha: 28/03/2026
 * @Funcionalidad: Server Actions para verificar el contador de publicaciones
 * del usuario y gestionar creación/asociación de publicaciones (HU5).
 */

import {prisma} from "@/lib/prisma";

// Valor inicial del contador para usuarios gratuitos
const INT_LIMITE_GRATUITO = 2;

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface EstadoPublicacionUsuario {
  intPublicacionesRestantes: number;
  bolLimiteAlcanzado:        boolean;
}

interface PublicacionFormData {
  titulo: string;
  precio: number;
  [key: string]: unknown;
}

// ─── Verificar contador del usuario ──────────────────────────────────────────
/**
 * @Dev: jimmyP
 * @Fecha: 29/03/2026
 * @Funcionalidad: Consulta cant_publicaciones_restantes del usuario en la BD.
 */
export async function verificarEstadoPublicacion(
  strUserId: string,
): Promise<EstadoPublicacionUsuario> {

  if (!strUserId || strUserId.trim() === "") {
    return { intPublicacionesRestantes: 0, bolLimiteAlcanzado: true };
  }

  const objUsuario = await prisma.usuario.findUnique({
    where:  { id_usuario: strUserId },
    select: { cant_publicaciones_restantes: true },
  });

  if (!objUsuario) {
    return { intPublicacionesRestantes: 0, bolLimiteAlcanzado: true };
  }

  const intRestantes = objUsuario.cant_publicaciones_restantes ?? INT_LIMITE_GRATUITO;
  
  return {
    intPublicacionesRestantes: intRestantes,
    bolLimiteAlcanzado: intRestantes <= 0,
  };
}

// ─── Crear publicación ────────────────────────────────────────────────────────
/**
 * @Dev: jimmyP
 * @Fecha: 28/03/2026
 * @Funcionalidad: Verifica el contador y crea una nueva publicación usando SQL Nativo.
 */
export async function verificarYCrearPublicacion(
  strUserId: string,
  objDatosFormulario: PublicacionFormData,
) {
  try {
    // 1. INICIALIZACIÓN SEGURA EN BD:
    // Si es su primera vez (NULL), lo seteamos a 2. Lo hacemos con SQL crudo para evitar
    // que dos pestañas lean "NULL" al mismo tiempo y ambas intenten inicializarlo.
    await prisma.$executeRaw`
      UPDATE "Usuario" 
      SET cant_publicaciones_restantes = ${INT_LIMITE_GRATUITO} 
      WHERE id_usuario = ${strUserId} AND cant_publicaciones_restantes IS NULL;
    `;

    // 2. EL GOLPE ATÓMICO INQUEBRANTABLE:
    // Le ordenamos a Postgres que reste 1, PERO SOLO si tiene cupos (> 0).
    // Prisma nos devolverá el número de filas que Postgres logró actualizar (1 o 0).
    const intFilasActualizadas = await prisma.$executeRaw`
      UPDATE "Usuario"
      SET cant_publicaciones_restantes = cant_publicaciones_restantes - 1
      WHERE id_usuario = ${strUserId} AND cant_publicaciones_restantes > 0;
    `;

    // 3. LA MURALLA: Si Postgres dice "actualicé 0 filas", significa que te quedaste sin cupos.
    if (intFilasActualizadas === 0) {
      return { success: false, reason: "LIMITE_ALCANZADO" };
    }

    // 4. CREACIÓN (Solo llega aquí la pestaña que logró restar el cupo en Postgres)
    const objNuevaPublicacion = await prisma.publicacion.create({
      data: {
        titulo:     objDatosFormulario.titulo,
        precio:     objDatosFormulario.precio,
        id_usuario: strUserId,
      },
    });

    return { success: true, id_publicacion: objNuevaPublicacion.id_publicacion };

  } catch (objError: unknown) {
    return { success: false, reason: "ERROR_SERVIDOR" };
  }
}

// ─── Asociar publicación existente ───────────────────────────────────────────
/**
 * @Dev: jimmyP
 * @Fecha: 28/03/2026
 * @Funcionalidad: Verifica el contador y asocia publicación usando SQL Nativo.
 */
export async function asociarPublicacionExistente(
  strUserId: string,
  intIdPublicacionCreada: number,
) {
  try {
    // Inicialización si es null
    await prisma.$executeRaw`
      UPDATE "Usuario" 
      SET cant_publicaciones_restantes = ${INT_LIMITE_GRATUITO} 
      WHERE id_usuario = ${strUserId} AND cant_publicaciones_restantes IS NULL;
    `;

    // Descuento atómico
    const intFilasActualizadas = await prisma.$executeRaw`
      UPDATE "Usuario"
      SET cant_publicaciones_restantes = cant_publicaciones_restantes - 1
      WHERE id_usuario = ${strUserId} AND cant_publicaciones_restantes > 0;
    `;

    // Muralla
    if (intFilasActualizadas === 0) {
      return { success: false, reason: "LIMITE_ALCANZADO" };
    }

    // Actualización de la publicación
    const objPublicacionActualizada = await prisma.publicacion.update({
      where: { id_publicacion: intIdPublicacionCreada },
      data:  { id_usuario: strUserId },
    });

    return { success: true, id_publicacion: objPublicacionActualizada.id_publicacion };

  } catch (objError: unknown) {
    return { success: false, reason: "ERROR_SERVIDOR" };
  }
}