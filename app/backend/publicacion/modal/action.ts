"use server";

/**
 * @Dev: Gustavo Montaño
 * @Fecha: 28/03/2026
 * @Modificación: StefanyS — 29/03/2026
 * @Funcionalidad: Server Actions para verificar el contador de publicaciones
 *                 del usuario y gestionar creación/asociación de publicaciones (HU5).
 */

import { prisma } from "@/lib/prisma";

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
 * @Dev: StefanyS
 * @Fecha: 29/03/2026
 * @Funcionalidad: Consulta cant_publicaciones_restantes del usuario en la BD.
 *                 Se llama SOLO al hacer click en "Publicar otro inmueble".
 *                 Si el contador es 0 → bolLimiteAlcanzado = true → mostrar modal.
 *                 Si el contador es mayor a 0 → redirigir al formulario.
 * @param {string} strUserId - UUID del usuario dueño de la publicación.
 * @return {Promise<EstadoPublicacionUsuario>} Estado con contador y flag de límite.
 */
export async function verificarEstadoPublicacion(
  strUserId: string,
): Promise<EstadoPublicacionUsuario> {

  // Si no hay userId válido bloquear por seguridad
  if (!strUserId || strUserId.trim() === "") {
    return { intPublicacionesRestantes: 0, bolLimiteAlcanzado: true };
  }

  const objUsuario = await prisma.usuario.findUnique({
    where:  { id_usuario: strUserId },
    select: { cant_publicaciones_restantes: true },
  });

  // Si el usuario no existe en BD, no permitir publicar
  if (!objUsuario) {
    return { intPublicacionesRestantes: 0, bolLimiteAlcanzado: true };
  }

  // Si cant_publicaciones_restantes es NULL, asumir que tiene el límite completo
  const intRestantes = objUsuario.cant_publicaciones_restantes ?? INT_LIMITE_GRATUITO;

  // Límite alcanzado únicamente cuando el contador llega a 0
  const bolLimiteAlcanzado = intRestantes <= 0;

  return {
    intPublicacionesRestantes: intRestantes,
    bolLimiteAlcanzado,
  };
}

// ─── Crear publicación ────────────────────────────────────────────────────────

/**
 * @Dev: Gustavo Montaño
 * @Fecha: 28/03/2026
 * @Funcionalidad: Verifica el contador y crea una nueva publicación en transacción atómica.
 * @param {string} strUserId - UUID del usuario autenticado.
 * @param {PublicacionFormData} objDatosFormulario - Datos del formulario.
 * @return {Promise<object>} Resultado con idPublicacion o razón del error.
 */
export async function verificarYCrearPublicacion(
  strUserId: string,
  objDatosFormulario: PublicacionFormData,
) {
  try {
    const intResultado = await prisma.$transaction(async (tx) => {
      const objUsuario = await tx.usuario.findUnique({
        where:  { id_usuario: strUserId },
        select: { cant_publicaciones_restantes: true },
      });

      const intRestantes = objUsuario?.cant_publicaciones_restantes ?? INT_LIMITE_GRATUITO;
      if (intRestantes <= 0) throw new Error("LIMITE_ALCANZADO");

      const objNuevaPublicacion = await tx.publicacion.create({
        data: {
          titulo:     objDatosFormulario.titulo,
          precio:     objDatosFormulario.precio,
          id_usuario: strUserId,
        },
      });

      // Decrementar el contador al crear una publicación
      await tx.usuario.update({
        where: { id_usuario: strUserId },
        data:  { cant_publicaciones_restantes: intRestantes - 1 },
      });

      return objNuevaPublicacion.id_publicacion;
    });

    return { success: true, id_publicacion: intResultado };
  } catch (objError: unknown) {
    if (objError instanceof Error && objError.message === "LIMITE_ALCANZADO") {
      return { success: false, reason: "LIMITE_ALCANZADO" };
    }
    return { success: false, reason: "ERROR_SERVIDOR" };
  }
}

// ─── Asociar publicación existente ───────────────────────────────────────────

/**
 * @Dev: Gustavo Montaño
 * @Fecha: 28/03/2026
 * @Funcionalidad: Verifica el contador y asocia una publicación existente al usuario.
 * @param {string} strUserId - UUID del usuario autenticado.
 * @param {number} intIdPublicacionCreada - ID de la publicación a asociar.
 * @return {Promise<object>} Resultado con idPublicacion o razón del error.
 */
export async function asociarPublicacionExistente(
  strUserId: string,
  intIdPublicacionCreada: number,
) {
  try {
    const intResultado = await prisma.$transaction(async (tx) => {
      const objUsuario = await tx.usuario.findUnique({
        where:  { id_usuario: strUserId },
        select: { cant_publicaciones_restantes: true },
      });

      const intRestantes = objUsuario?.cant_publicaciones_restantes ?? INT_LIMITE_GRATUITO;
      if (intRestantes <= 0) throw new Error("LIMITE_ALCANZADO");

      const objPublicacionActualizada = await tx.publicacion.update({
        where: { id_publicacion: intIdPublicacionCreada },
        data:  { id_usuario: strUserId },
      });

      await tx.usuario.update({
        where: { id_usuario: strUserId },
        data:  { cant_publicaciones_restantes: intRestantes - 1 },
      });

      return objPublicacionActualizada.id_publicacion;
    });

    return { success: true, id_publicacion: intResultado };
  } catch (objError: unknown) {
    if (objError instanceof Error && objError.message === "LIMITE_ALCANZADO") {
      return { success: false, reason: "LIMITE_ALCANZADO" };
    }
    return { success: false, reason: "ERROR_SERVIDOR" };
  }
}