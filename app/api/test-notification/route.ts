import { NextResponse } from "next/server";
import { sendWhatsAppNotification } from "@/lib/whatsapp/send-whatsapp";

export async function POST() {
  const now = new Date();

  const message =
    `✅ Prueba de notificación\n\n` +
    `📅 Fecha: ${now.toLocaleString("es-BO")}\n` +
    `🏠 Propiedad: CASA-102\n` +
    `📄 Operación: Alquiler\n` +
    `👨‍💼 Agente: Juan Pérez`;

  const whatsappResult = await sendWhatsAppNotification({
    to: "+59173678412", 
    title: "Prueba",
    body: message,
  });

  return NextResponse.json({
    ok: true,
    whatsappResult,
  });
}