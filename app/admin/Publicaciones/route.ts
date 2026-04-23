import { NextResponse } from "next/server";
import * as servicios from "@/features/admin-publicaciones/servicios";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id_usuario, id_plan, accion } = body;

    if (!id_usuario && accion !== "check_expirados") {
      return NextResponse.json({ error: "UID de usuario requerido" }, { status: 400 });
    }

    switch (accion) {
      case "validar_pago":
        // Ejecuta Upgrade, Suspensión/Reactivación y Notificación de una vez
        await servicios.procesarCambioPlan(id_usuario, id_plan);
        return NextResponse.json({ success: true, message: "Plan actualizado correctamente" });

      case "check_expirados":
        // Ejecuta la verificación masiva diaria
        await servicios.verificarSuscripcionesMasivas();
        return NextResponse.json({ success: true, message: "Proceso de expiración finalizado" });

      default:
        return NextResponse.json({ error: "Acción no permitida" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: "Error en el servidor", details: error.message }, { status: 500 });
  }
}