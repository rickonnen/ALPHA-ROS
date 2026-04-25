import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Verificación de seguridad mediante Bearer token
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    console.log('[cron/suspend-expired] Iniciando verificación de suscripciones expiradas...');
    const start = Date.now();

    const estadoActivo = await prisma.estadoPublicacion.findFirst({ where: { nombre_estado: 'Activo' } });
    const estadoSuspendido = await prisma.estadoPublicacion.findFirst({ where: { nombre_estado: 'Suspendido' } });

    if (!estadoActivo || !estadoSuspendido) {
      throw new Error('Estados requeridos no encontrados en la DB.');
    }

    // Transacción atómica requerida por el Criterio de Aceptación 6 de la HU6
    const result = await prisma.$transaction(async (tx) => {
      const hoy = new Date();
      
      // Obtener suscripciones cuya fecha_fin ya pasó
      const suscripcionesExpiradas = await tx.suscripcion.findMany({
        where: { fecha_fin: { lt: hoy } }
      });

      const usuariosExpiradosIds = suscripcionesExpiradas.map(sub => sub.id_usuario);

      if (usuariosExpiradosIds.length === 0) {
        return { suspendidas: 0, usuarios_afectados: 0 };
      }

      // Cambiar publicaciones activas a suspendidas para estos usuarios
      const updateResult = await tx.publicacion.updateMany({
        where: {
          id_usuario: { in: usuariosExpiradosIds },
          id_estado: estadoActivo.id_estado
        },
        data: { id_estado: estadoSuspendido.id_estado }
      });

      // Limpiar cuota del usuario
      await tx.usuario.updateMany({
        where: { id_usuario: { in: usuariosExpiradosIds } },
        data: { cant_publicaciones_restantes: 0 }
      });

      return { suspendidas: updateResult.count, usuarios_afectados: usuariosExpiradosIds.length };
    });

    const duration = Date.now() - start;
    console.log(`[cron/suspend-expired] Completado en ${duration}ms. Suspendidas: ${result.suspendidas}`);

    return NextResponse.json({
      success: true,
      data: result,
      duration_ms: duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[cron/suspend-expired] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}