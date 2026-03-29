
// Importamos el cliente de Prisma que creamos en la raíz de backend
import { prisma } from '../../prisma';


export const obtenerDetallesDelPlan = async (planId: number) => {
  try {
    // Buscamos directamente en Supabase usando el ID que viene de la URL
    const plan = await prisma.planPublicacion.findUnique({
      where: { id_plan: planId }
    });

    if (!plan) return null;

    // Retornamos la estructura que el frontend ya espera
    return {
      nombre: plan.nombre_plan,
      total: Number(plan.precio_plan), 
      descripcion: `Este plan incluye +${plan.cant_publicaciones} cupos de publicación para tus inmuebles`
    };
  } catch (error) {
    console.error("Error al sincronizar con Supabase:", error);
    throw error;
  }
};


/**
 * fecha 26/03/2026
 * funcionalidad: 
 */



export const obtenerQrRealBD = async (idMetodo: number) => {
    try {
        const qr = await prisma.qrUrl.findUnique({
            where: { id_metodo: idMetodo }
        });
        return qr?.qr_URL;
    } catch (error) {
        console.error("Error al leer QR en BD:", error);
        return null;
    }
};


export const verificarPagoRealBD = async (id: number) => {
    try {
        return await prisma.detallePago.update({
            where: { id_detalle: id },
            data: { estado: 1 }
        });
    } catch (error) {
        console.error("Error al actualizar estado en BD:", error);
        throw error;
    }
};

export const obtenerDetallesDelPlanBD = async (planId: number) => {
  try {
    const plan = await prisma.planPublicacion.findUnique({
      where: { id_plan: planId }
    });

    if (!plan) return null;

    return {
      nombre: plan.nombre_plan,
      total: Number(plan.precio_plan), // Convertimos de Decimal a Number
      descripcion: `Este plan incluye +${plan.cant_publicaciones} cupos de publicación para tus inmuebles`
    };
  } catch (error) {
    console.error("Error en Service al traer plan:", error);
    throw error;
  }
};