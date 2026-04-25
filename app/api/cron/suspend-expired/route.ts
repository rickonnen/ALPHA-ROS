import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const estadoActivo = await prisma.estadoPublicacion.findFirst({ where: { nombre_estado: 'Activo' } });
    const estadoSuspendido = await prisma.estadoPublicacion.findFirst({ where: { nombre_estado: 'Suspendido' } });

    if (!estadoActivo || !estadoSuspendido) {
      throw new Error("Estados de publicación no encontrados en la BD");
    }

    const suspendidas = await prisma.$transaction(async (tx) => {
      const hoy = new Date();
      
      const suscripcionesVencidas = await tx.suscripcion.findMany({
        where: { fecha_fin: { lt: hoy } }
      });

      const idsUsuarios = suscripcionesVencidas.map(sub => sub.id_usuario);
      if (idsUsuarios.length === 0) return 0; // Nadie expiró hoy

      const publicacionesActualizadas = await tx.publicacion.updateMany({
        where: { id_usuario: { in: idsUsuarios }, id_estado: estadoActivo.id_estado },
        data: { id_estado: estadoSuspendido.id_estado }
      });

      await tx.usuario.updateMany({
        where: { id_usuario: { in: idsUsuarios } },
        data: { cant_publicaciones_restantes: 0 }
      });

      return publicacionesActualizadas.count;
    });

    return NextResponse.json({ 
      success: true, 
      mensaje: `Proceso completado. Publicaciones suspendidas: ${suspendidas}` 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}