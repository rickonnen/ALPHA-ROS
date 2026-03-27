// backend/controllers/planController.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 1. Obtener todos los planes
export async function getPlanes() {
  try {
    const planes = await prisma.planPublicacion.findMany({
      orderBy: {
        precio_plan: 'asc',
      },
    });
    return planes;
  } catch (error) {
    console.error("Error al obtener los planes:", error);
    throw new Error("No se pudieron cargar los planes de publicación.");
  }
}
