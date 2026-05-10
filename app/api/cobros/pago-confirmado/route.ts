import { NextRequest, NextResponse } from "next/server";
import { enviarConfirmacionPago } from "@/lib/email/emailService";
import { crearNotificacion } from "@/lib/notifications/notificationService";

export async function POST(req: NextRequest) {
  try {
    const { id_usuario, email, nombre, plan, frecuencia, monto, cupos } = await req.json();

    // Validar datos requeridos
    if (!id_usuario || !email || !nombre || !plan || !frecuencia || !monto || !cupos) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // 1. Enviar email
    const emailResult = await enviarConfirmacionPago(
      email,
      nombre,
      plan,
      frecuencia,
      monto,
      cupos
    );
    
    if (!emailResult.success) {
      console.error("[PAGO] Error enviando email:", emailResult.error);
    }

    // 2. Crear notificación in-app
    await crearNotificacion({
      id_usuario,
      titulo: ` Plan ${plan} Activado`,
      mensaje: `Tu pago de $${monto} (${frecuencia}) ha sido confirmado. ¡Disfruta de tu nuevo plan con ${cupos} cupos de publicación!`,
      id_categoria: 2, // Categoría de Cobros
    });

    return NextResponse.json({
      ok: true,
      message: "Pago procesado y notificación creada"
    });

  } catch (error) {
    console.error("[PAGO] Error:", error);
    return NextResponse.json(
      { error: "Error procesando pago" },
      { status: 500 }
    );
  }
}