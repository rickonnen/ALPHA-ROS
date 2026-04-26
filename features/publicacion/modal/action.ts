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
          id_plan: true,          // ← traer id_plan explícitamente
          PlanPublicacion: {
            select: {
              cant_publicaciones: true,
              nombre_plan: true,  // ← útil para debug
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
    objSuscripcion.PlanPublicacion !== null &&          // ← verificar que el plan existe
    objSuscripcion.PlanPublicacion.cant_publicaciones !== null  // ← y tiene límite definido
  ) {
    const intPermitidas = objSuscripcion.PlanPublicacion.cant_publicaciones!;
    const intHechas     = objUsuario.publicaciones_hechas ?? 0;
    const intRestantes  = intPermitidas - intHechas;

    if (intRestantes <= 0) {
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

  // ── RAMA 2: Sin plan activo → flujo gratuito ──────────────────────────
  const intRestantesGratuitos = objUsuario.cant_publicaciones_restantes ?? INT_LIMITE_GRATUITO;

  return {
    intPublicacionesRestantes: intRestantesGratuitos,
    bolLimiteAlcanzado: intRestantesGratuitos <= 0,
    strTipoLimite: intRestantesGratuitos <= 0 ? "gratuito" : "ninguno",
  };
}