import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { upsertUserSubscription } from "@/features/cobros/verificacion-pagos/services/subscriptionService";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { paymentId, userId, nuevoEstado, planId, modalidad } = await req.json();
    
    // Aceptado = 2, Rechazado = 3
    let estadocrip = 1; 

    //por si el rodri se wasea y pueda poner eso o el numero xdxdxdxdxddxdxxddxxdxdd
    if (nuevoEstado === "finished" || nuevoEstado === 2 || nuevoEstado === "2") {
      estadocrip = 2;
    } else if (nuevoEstado === "failed" || nuevoEstado === "partially_paid" || nuevoEstado === 3 || nuevoEstado === "3") {
      estadocrip = 3;
    }

    const resultado = await prisma.$transaction(async (tx) => {
      // Creamos el detalle del pago
      const nuevoPago = await tx.detallePago.create({
        data: {
          id_plan: planId ? parseInt(planId) : null,
          id_cripto: paymentId,
          id_usuario: userId,
          estado: estadocrip,
          metodo_pago: "Transferencia virtual",
          fecha_detalle: new Date(),
        },
      });

      if (estadocrip === 2) {
        await upsertUserSubscription(
          tx, 
          userId, 
          parseInt(planId), 
          modalidad || "mensual"
        );
      }

      return nuevoPago;
    });

    

    return NextResponse.json({
      success: true,
      mensaje: estadocrip === 2 ? "Pago y suscripción actualizados" : "Registro creado",
      data: resultado
    });

  } catch (error) {
    console.error("Error al crear detalle de pago:", error);
    return NextResponse.json(
      { error: "No se pudo crear el registro. Verifica que el userId sea válido." }, 
      { status: 500 }
    );
  }
}