"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Esta función será llamada por Gabriel cuando el pago sea verificado.
 * Registra la promoción y actualiza la prioridad del inmueble.
 */
export async function confirmarPagoAccion(planId: number, idPublicacion: string | null) {
  if (!idPublicacion) return { error: "Faltan datos obligatorios" };

  try {
    const plan = await prisma.planPublicacion.findUnique({
      where: { id_plan: planId }
    });

    if (!plan) return { error: "Plan no encontrado" };

    // Definimos si es Oro/Plata (Alta prioridad) según el precio
    const esPrioritario = Number(plan.precio_plan) >= 4.5;

    await prisma.$transaction([
      // Cambia la prioridad en la tabla Publicacion (Lo que te pidieron)
      prisma.publicacion.update({
        where: { id_publicacion: Number(idPublicacion) },
        data: { prioridad: esPrioritario }
      })
    ]);

    revalidatePath("/perfil/publicacion");
    return { success: true };
    
  } catch (error) {
    console.error("Error al procesar la vinculación:", error);
    return { error: "Error en el servidor al actualizar la base de datos" };
  }
}