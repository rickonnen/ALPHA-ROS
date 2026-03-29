"use server"; 

/**
 * @file actions.ts
 * @description Acciones de servidor (Server Actions) para la creación y asociación de publicaciones, 
 * gestionando transacciones atómicas y validando la restricción de cupos (HU5).
 */

import { prisma } from "@/lib/prisma";

// Uso del prefijo 'str' para variables de tipo texto (UUID)
const strUserId = "8cb1d337-7122-4b22-8f46-31c8af92b5a6"; 

// Tipo para los datos del formulario de publicación
interface PublicacionFormData {
  titulo: string;
  precio: number;
  [key: string]: unknown;
}

// ==========================================
// HERRAMIENTA 1: El Flujo Definitivo (Crear de cero)
// ==========================================

/**
 * Verifica si el usuario tiene cupos disponibles y crea una nueva publicación,
 * descontando el cupo utilizado en la misma transacción.
 * @param {PublicacionFormData} objDatosFormulario - Objeto que contiene los datos de la publicación.
 * @returns {Promise<object>} Objeto con el estado de la operación y el ID de la publicación o la razón del error.
 */
export async function verificarYCrearPublicacion(objDatosFormulario: PublicacionFormData) {
  try {
    // Uso del prefijo 'int' porque el resultado final es el ID numérico de la publicación
    const intResultado = await prisma.$transaction(async (tx) => {
      
      // Uso del prefijo 'obj' para el registro obtenido de la BD
      const objUsuario = await tx.usuario.findUnique({
        where: { id_usuario: strUserId },
        select: { cant_publicaciones_restantes: true }
      });
      
      // Uso del prefijo 'int' para variables numéricas
      const intRestantes = objUsuario?.cant_publicaciones_restantes ?? 2;

      if (intRestantes <= 0) throw new Error("LIMITE_ALCANZADO"); 

      // Uso del prefijo 'obj' para el nuevo registro creado en la BD
      const objNuevaPublicacion = await tx.publicacion.create({
         data: {
           titulo: objDatosFormulario.titulo,
           precio: objDatosFormulario.precio,
           id_usuario: strUserId,
         }
      });

      await tx.usuario.update({
        where: { id_usuario: strUserId },
        data: { cant_publicaciones_restantes: intRestantes - 1 }
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


// ==========================================
// HERRAMIENTA 2: (Asociar)
// ==========================================

/**
 * Verifica si el usuario tiene cupos disponibles y se apropia de una publicación existente,
 * vinculando el id del usuario a la publicación y descontando el cupo utilizado.
 * @param {number} intIdPublicacionCreada - ID numérico de la publicación que ya existe en la base de datos.
 * @returns {Promise<object>} Objeto con el estado de la operación y el ID de la publicación actualizada.
 */
export async function asociarPublicacionExistente(intIdPublicacionCreada: number) {
  try {
    const intResultado = await prisma.$transaction(async (tx) => {
        
      const objUsuario = await tx.usuario.findUnique({
        where: { id_usuario: strUserId },
        select: { cant_publicaciones_restantes: true }
      });
      
      const intRestantes = objUsuario?.cant_publicaciones_restantes ?? 2;

      if (intRestantes <= 0) throw new Error("LIMITE_ALCANZADO"); 

      // Actualizamos la publicación existente
      const objPublicacionActualizada = await tx.publicacion.update({
         where: { id_publicacion: intIdPublicacionCreada },
         data: { id_usuario: strUserId } 
      });

      await tx.usuario.update({
        where: { id_usuario: strUserId },
        data: { cant_publicaciones_restantes: intRestantes - 1 }
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