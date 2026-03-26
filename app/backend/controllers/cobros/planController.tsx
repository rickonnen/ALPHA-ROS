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

// 2. Crear un plan nuevo
export async function createPlan(data: {
  nombre_plan: string;
  precio_plan: number; // Tu app envía un número normal
  cant_publicaciones: number;
}) {
  try {
    const nuevoPlan = await prisma.planPublicacion.create({
      data: {
        nombre_plan: data.nombre_plan,
        precio_plan: data.precio_plan.toString(), 
        cant_publicaciones: data.cant_publicaciones,
      },
    });
    return nuevoPlan;
  } catch (error) {
    console.error("Error al crear el plan:", error);
    throw new Error("No se pudo crear el plan.");
  }
}