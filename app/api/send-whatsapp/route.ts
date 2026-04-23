import { NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromWhatsApp = process.env.TWILIO_WHATSAPP_FROM;

const client = twilio(accountSid, authToken);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, message, notificationId } = body;

    // Validar que tengamos los datos necesarios
    if (!to || !message) {
      return NextResponse.json(
        { error: "Faltan parámetros: to y message son requeridos" },
        { status: 400 }
      );
    }

    // Validar que el número tenga el formato correcto para WhatsApp
    let formattedNumber = to;
    if (!to.includes("whatsapp:")) {
      formattedNumber = `whatsapp:${to}`;
    }

    // Enviar mensaje de WhatsApp
    const twilioMessage = await client.messages.create({
      body: message,
      from: fromWhatsApp,
      to: formattedNumber,
    });

    console.log(`Mensaje de WhatsApp enviado: ${twilioMessage.sid}`);

    return NextResponse.json({
      success: true,
      messageSid: twilioMessage.sid,
      notificationId,
    });
  } catch (error) {
    console.error("Error al enviar mensaje de WhatsApp:", error);
    return NextResponse.json(
      { error: "Error al enviar el mensaje de WhatsApp" },
      { status: 500 }
    );
  }
}
