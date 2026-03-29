"use server"; 

// ⚠️ MOCK (SIMULADOR) PARA PROBAR LA HU5 SIN BASE DE DATOS
// Usamos una variable global temporal para simular la base de datos en Next.js
let cuposSimulados = 2;

export async function verificarYCrearPublicacion(datosPublicacion: any) {
  // Simulamos el tiempo de espera de una base de datos real (1 segundo)
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    // 1. Verificamos el límite
    if (cuposSimulados <= 0) {
      throw new Error("LIMITE_ALCANZADO"); 
    }

    // 2. Si hay cupo, descontamos 1 (simulando la actualización en Prisma)
    cuposSimulados -= 1;
    console.log(`Publicación guardada. Cupos restantes: ${cuposSimulados}`);

    // 3. Simulamos que devolvemos la nueva publicación guardada
    return { 
        success: true, 
        publicacion: { id_publicacion: Math.floor(Math.random() * 1000) } 
    };

  } catch (error: any) {
    if (error.message === "LIMITE_ALCANZADO") {
      return { success: false, reason: "LIMITE_ALCANZADO" };
    }
    return { success: false, reason: "ERROR_SERVIDOR" };
  }
}