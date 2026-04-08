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

