import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: NextRequest) {
  /*if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  */

  try {
    const start = Date.now();

    // 1. Obtener los IDs de estado correctos
    const estadoActiva = await prisma.estadoPublicacion.findFirst({ where: { nombre_estado: 'Activa' } });
    const estadoSuspencion = await prisma.estadoPublicacion.findFirst({ where: { nombre_estado: 'Suspencion' } });

    if (!estadoActiva || !estadoSuspencion) {
      throw new Error('Estados requeridos no encontrados en la DB.');
    }

    const result = await prisma.$transaction(async (tx) => {
      const hoy = new Date();
      console.log("--- INICIO DEPURACIÓN CRON ---");
      console.log("Fecha actual (hoy):", hoy.toISOString());
      // 2. Buscar usuarios que NO tengan el plan 7 y cuya fecha haya vencido
      const suscripcionesExpiradas = await tx.suscripcion.findMany({
        where: { 
          fecha_fin: { lt: hoy },
          NOT: { id_plan: 7 } // Ignoramos a los que ya están "Sin Plan"
        }
      });

      console.log("Suscripciones expiradas encontradas:", suscripcionesExpiradas.length);
      if (suscripcionesExpiradas.length > 0) {
        console.log("Primeros IDs de usuarios expirados:", suscripcionesExpiradas.slice(0, 3).map(s => s.id_usuario));
      }


      const usuariosExpiradosIds = suscripcionesExpiradas.map(sub => sub.id_usuario);

      if (usuariosExpiradosIds.length === 0) {
        return { suspendidas: 0, planes_reseteados: 0 };
      }

      // 3. Suspender publicaciones de estos usuarios
      const updatePubs = await tx.publicacion.updateMany({
        where: {
          id_usuario: { in: usuariosExpiradosIds },
          gratuito: false,
          id_estado: 1
        },
        data: { 
          id_estado: 4 
      }
  });
      
      console.log("RESULTADO UPDATE PUBLICACIONES:");
      console.log("- Cantidad afectada:", updatePubs.count);

      // 4. Regresar a los usuarios al Plan 7 (Sin Plan)
      const updateSubs = await tx.suscripcion.updateMany({
        where: { id_usuario: { in: usuariosExpiradosIds } },
        data: { id_plan: 7 } 
      });

      console.log("RESULTADO UPDATE PLANES:");
      console.log("- Cantidad afectada:", updateSubs.count);
      console.log("--- FIN DEPURACIÓN ---");


      return { 
        suspendidas: updatePubs.count, 
        planes_reseteados: updateSubs.count 
      };
    });

    const duration = Date.now() - start;
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