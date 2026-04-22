import { prisma } from "@/lib/prisma";
import type { PlanPublicacion } from "@prisma/client";

/**
 * Obtiene todos los planes de publicación activos
 * Usado tanto en el servidor como en las rutas API
 * @returns Array de planes ordenados por precio (ascendente)
 */
export async function getPlanesPublicacion(): Promise<PlanPublicacion[]> {
  try {
    const planes = await prisma.planPublicacion.findMany({
      where: {
        activo: true,
      },
      orderBy: {
        precio_plan: "asc",
      },
    });
    return planes;
  } catch (error) {
    console.error("Error al obtener los planes de publicación:", error);
    throw new Error("No se pudieron cargar los planes de publicación.");
  }
}
