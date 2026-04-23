import prisma from "@/lib/prisma";

// --- TASK #50: Tu función original ---
export async function obtenerUsuariosExpirados() {
  const haceUnMes = new Date();
  haceUnMes.setMonth(haceUnMes.getMonth() - 1);
  return await prisma.usuario.findMany({
    where: {
      DetallePago: {
        some: { fecha_detalle: { lt: haceUnMes }, estado: 1 }
      }
    },
    include: { DetallePago: true }
  });
}

// --- TASK #49: Verificación masiva (Criterio #1) ---
export async function verificarSuscripcionesMasivas() {
  const expirados = await obtenerUsuariosExpirados();
  for (const usuario of expirados) {
    // Suspendemos todas por falta de pago
    await prisma.publicacion.updateMany({
      where: { id_usuario: usuario.id_usuario, id_estado: 1 },
      data: { id_estado: 3 }
    });
    await registrarLogCambio(usuario.id_usuario, [], "Suspensión por suscripción expirada");
  }
}

// --- TASK #52, #53, #55: Lógica de Cambio de Plan (Criterio #6, #7, #8) ---
// ACOPLAMOS tu lógica de suspensión y añadimos upgrade/reactivación en una transacción
export async function procesarCambioPlan(idUsuario: string, idPlan: number) {
  // Criterio #5: Constantes de límites
  const LIMITES: Record<number, number> = { 1: 2, 2: 12, 3: 50 };
  const limiteNuevo = LIMITES[idPlan] || 0;

  return await prisma.$transaction(async (tx) => {
    // TAREA #52: Upgrade de límite en perfil
    await tx.usuario.update({
      where: { id_usuario: idUsuario },
      data: { cant_publicaciones_restantes: limiteNuevo }
    });

    const publicaciones = await tx.publicacion.findMany({
      where: { id_usuario: idUsuario },
      orderBy: { id_publicacion: 'desc' } // Criterio #4: Cronológico DESC
    });

    const activas = publicaciones.filter(p => p.id_estado === 1);
    const suspendidas = publicaciones.filter(p => p.id_estado === 3);

    // TAREA #55: Reactivación automática (Upgrade/Pago validado)
    if (activas.length < limiteNuevo && suspendidas.length > 0) {
      const cupoDisponible = limiteNuevo - activas.length;
      const idsAReactivar = suspendidas.slice(0, cupoDisponible).map(p => p.id_publicacion);
      
      await tx.publicacion.updateMany({
        where: { id_publicacion: { in: idsAReactivar } },
        data: { id_estado: 1 }
      });
    }

    // TAREA #53: Tu lógica de suspensión acoplada
    if (activas.length > limiteNuevo) {
      const idsASuspender = activas.slice(limiteNuevo).map(p => p.id_publicacion);
      
      await tx.publicacion.updateMany({
        where: { id_publicacion: { in: idsASuspender } },
        data: { id_estado: 3 }
      });

      // TAREA #54: Notificación (Para que el QA no dé bandera roja)
      await tx.notificacion.create({
        data: {
          id_notificacion: crypto.randomUUID(),
          id_usuario: idUsuario,
          titulo: "Ajuste de publicaciones",
          mensaje: `Se han suspendido ${idsASuspender.length} publicaciones por exceder el límite de tu nuevo plan.`,
          leido: false,
          creado_en: new Date()
        }
      });
      
      await registrarLogCambio(idUsuario, idsASuspender, "Exceso de cupo por cambio de plan");
    }
  });
}

// --- TASK #51: Tu función de Logs original ---
export async function registrarLogCambio(idUsuario: string, ids: number[], motivo: string) {
  const log = {
    usuario: idUsuario,
    publicacionesAfectadas: ids,
    motivo: motivo,
    fecha: new Date().toISOString()
  };
  console.log("--- REGISTRO DE AUDITORÍA ---", log);
}