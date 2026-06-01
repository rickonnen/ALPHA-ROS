"use server";

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
          id_plan: true,
          PlanPublicacion: {
            select: {
              cant_publicaciones: true,
              nombre_plan: true,
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

  // ── RAMA 1: Tiene suscripción con plan activo vigente ──────────────────
  if (
    objSuscripcion &&
    objSuscripcion.fecha_fin > hoy &&
    objSuscripcion.PlanPublicacion !== null &&
    objSuscripcion.PlanPublicacion.cant_publicaciones !== null
  ) {
    const intPermitidas = objSuscripcion.PlanPublicacion.cant_publicaciones!;

    // Contar solo publicaciones de pago, igual que el trigger
    const intPublisDePlan = await prisma.publicacion.count({
      where: {
        id_usuario: strUserId,
        gratuito: false,
      },
    });

    const intRestantesPlan = intPermitidas - intPublisDePlan;

    if (intRestantesPlan > 0) {
      // Aún tiene cupo en el plan
      return {
        intPublicacionesRestantes: intRestantesPlan,
        bolLimiteAlcanzado: false,
        strTipoLimite: "ninguno",
      };
    }

    // Plan agotado → revisar colchón gratuito
    const intRestantesGratuitos = objUsuario.cant_publicaciones_restantes ?? 0;

    return {
      intPublicacionesRestantes: intRestantesGratuitos,
      bolLimiteAlcanzado: intRestantesGratuitos <= 0,
      strTipoLimite: intRestantesGratuitos <= 0 ? "plan" : "ninguno",
    };
  }

  // ── RAMA 2: Sin plan activo → flujo gratuito ──────────────────────────
  const intRestantesGratuitos = objUsuario.cant_publicaciones_restantes ?? INT_LIMITE_GRATUITO;

  return {
    intPublicacionesRestantes: intRestantesGratuitos,
    bolLimiteAlcanzado: intRestantesGratuitos <= 0,
    strTipoLimite: intRestantesGratuitos <= 0 ? "gratuito" : "ninguno",
  };
}