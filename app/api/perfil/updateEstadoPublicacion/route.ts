/* Dev: Rene Gabriel Vera Portanda
    Fecha: 27/04/2026
    Funcionalidad: PATCH /api/perfil/updateEstadoPublicacion
      - Cambia el estado de una publicación (ej. 1 Activa, 4 Suspendida)
      - Valida límites dinámicos consultando la tabla Suscripcion y PlanPublicacion
      - Query params: ?id_usuario=...&id_publicacion=...&id_estado=...
*/

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id_usuario = searchParams.get("id_usuario");
  const id_publicacion = searchParams.get("id_publicacion");
  const id_estado = searchParams.get("id_estado");

  // 1. Validar que lleguen todos los datos
  if (!id_usuario || !id_publicacion || !id_estado) {
    return NextResponse.json(
      { error: "Faltan parámetros: id_usuario, id_publicacion o id_estado" },
      { status: 400 }
    );
  }

  const idPub = Number(id_publicacion);
  const idEst = Number(id_estado);

  try {
      const publicacion = await prisma.publicacion.findUnique({
        where: { id_publicacion: idPub },
      });

      if (!publicacion) {
        return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 });
      }

      if (publicacion.id_usuario !== id_usuario) {
        return NextResponse.json({ error: "No tienes permiso" }, { status: 403 });
      }

      if (publicacion.gratuito) {
        return NextResponse.json({ error: "No se puede cambiar el estado de una publicación gratuita" }, { status: 400 });
      }

      const estadoAnterior = publicacion.id_estado ?? -1;
      const estadosQueOcupanCupo = [1, 2, 3];

      if (!estadosQueOcupanCupo.includes(estadoAnterior) && estadosQueOcupanCupo.includes(idEst)) {
        // 1. Buscamos la suscripción del usuario incluyendo los datos del plan asociado
        const suscripcion = await prisma.suscripcion.findUnique({
          where: { id_usuario: id_usuario },
          include: { PlanPublicacion: true },
        });
        const limiteTotal = suscripcion?.PlanPublicacion?.cant_publicaciones ?? 0;

        // 2. Conteo de publicaciones activas (estado 1,2,3) excluyendo las gratuitas
        const activasActuales = await prisma.publicacion.count({
          where: { 
              id_usuario: id_usuario, 
              id_estado:{ in: estadosQueOcupanCupo },
              gratuito: false,
            },
        });

        // 3. Validación de intento de activación
        if (activasActuales >= limiteTotal) {
          return NextResponse.json(
            { error: "No tienes cupos disponibles. Adquiere un plan para publicar." },
            { status: 400 }
          );
        }
      }

    // 4. Actualizamos el estado
      await prisma.publicacion.update({
        where: { id_publicacion: idPub },
        data: {
          id_estado: idEst,
        },
      });

      return NextResponse.json(
        { message: "Estado de la publicación actualizado correctamente" },
        { status: 200 }
      );
    } catch (error) {
    console.error("Error al actualizar el estado de la publicación:", error);
      return NextResponse.json(
        { error: "Error interno del servidor" }, 
        { status: 500 }
      );
  }
}