"use server";

/**
 * @Dev: jimmyP / Oliver
 * @Fecha: 18/04/2026
 * @Funcionalidad: Server Actions para verificar el contador de publicaciones
 * del usuario. Maneja tanto el flujo gratuito (HU5) como el de plan activo (HU7).
 */

import { prisma } from "@/lib/prisma";

const INT_LIMITE_GRATUITO = 2;

export type TipoLimite = "ninguno" | "gratuito" | "plan";

export interface EstadoPublicacionUsuario {
  intPublicacionesRestantes: number;
  bolLimiteAlcanzado: boolean;
  strTipoLimite: TipoLimite;
}

export async function verificarEstadoPublicacion(
  strUserId: string,
): Promise<EstadoPublicacionUsuario> {

  if (!strUserId || strUserId.trim() === "") {
    return { intPublicacionesRestantes: 0, bolLimiteAlcanzado: true, strTipoLimite: "gratuito" };
  }

  const objUsuario = await prisma.usuario.findUnique({
    where: { id_usuario: strUserId },
    select: {
      cant_publicaciones_restantes: true,
      publicaciones_hechas: true,
      Suscripcion: {
        select: {
          fecha_fin: true,
          PlanPublicacion: {
            select: {
              cant_publicaciones: true,
            },
          },
        },
      },
    },
  });

  if (!objUsuario) {
    return { intPublicacionesRestantes: 0, bolLimiteAlcanzado: true, strTipoLimite: "gratuito" };
  }

  const hoy = new Date();
  const objSuscripcion = objUsuario.Suscripcion;

  // ── RAMA 1: Tiene plan activo vigente (fecha_fin > hoy) ──────────────────
  if (objSuscripcion && objSuscripcion.fecha_fin > hoy) {
    const intPermitidas = objSuscripcion.PlanPublicacion?.cant_publicaciones ?? 0;
    const intHechas     = objUsuario.publicaciones_hechas ?? 0;
    const intRestantes  = intPermitidas - intHechas;

    if (intRestantes <= 0) {
      // Excedió el límite del plan activo → modal HU7
      return {
        intPublicacionesRestantes: 0,
        bolLimiteAlcanzado: true,
        strTipoLimite: "plan",
      };
    }

    return {
      intPublicacionesRestantes: intRestantes,
      bolLimiteAlcanzado: false,
      strTipoLimite: "ninguno",
    };
  }

  // ── RAMA 2: Sin plan activo → flujo gratuito original HU5 (sin cambios) ──
  const intRestantesGratuitos = objUsuario.cant_publicaciones_restantes ?? INT_LIMITE_GRATUITO;

  return {
    intPublicacionesRestantes: intRestantesGratuitos,
    bolLimiteAlcanzado: intRestantesGratuitos <= 0,
    strTipoLimite: intRestantesGratuitos <= 0 ? "gratuito" : "ninguno",
  };
}