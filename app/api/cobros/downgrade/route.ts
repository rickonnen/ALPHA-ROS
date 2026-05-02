import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { id_usuario, nuevo_plan_id, modalidad } = await req.json();

    if (!id_usuario || !nuevo_plan_id || !modalidad) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      
      const plan = await tx.planPublicacion.findUnique({
        where: { id_plan: Number(nuevo_plan_id) },
        select: { cant_publicaciones: true }
      });

      if (!plan) throw new Error("El plan seleccionado no existe");

      // SOLUCIÓN: Usamos el operador ?? para asegurar que siempre sea un número
      // Si por alguna razón es null en la DB, tomará 0 como límite.
      const limitePermitido = plan.cant_publicaciones ?? 0;

      const publicacionesActivas = await tx.publicacion.findMany({
        where: {
          id_usuario: id_usuario,
          id_estado: 1,
          gratuito: false
        },
        orderBy: [
          { fecha_creacion: 'desc' },
          { id_publicacion: 'desc' }
        ],
        select: { id_publicacion: true }
      });

      // Ahora TypeScript ya no se quejará porque limitePermitido es un number garantizado
      if (publicacionesActivas.length > limitePermitido) {
        const cantidadASuspender = publicacionesActivas.length - limitePermitido;
        const idsASuspender = publicacionesActivas
          .slice(0, cantidadASuspender)
          .map(p => p.id_publicacion);

        await tx.publicacion.updateMany({
          where: {
            id_publicacion: { in: idsASuspender }
          },
          data: {
            id_estado: 4 
          }
        });
      }

      const suscripcionActualizada = await tx.suscripcion.update({
        where: { id_usuario: id_usuario },
        data: {
          id_plan: Number(nuevo_plan_id),
          modalidad: modalidad,
        },
      });

      return suscripcionActualizada;
    });

    return NextResponse.json({
      success: true,
      message: "Plan actualizado y exceso de publicaciones suspendido",
      data: resultado,
    });

  } catch (error) {
    console.error("Error en el proceso de downgrade:", error);
    
    let errorMessage = "No se pudo procesar el cambio";
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      errorMessage = `Error de base de datos: ${error.code}`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}