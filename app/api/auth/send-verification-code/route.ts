import { NextRequest, NextResponse } from "next/server";
import { saveVerificationCode } from "@/lib/verificationCodes";

// Enviar email usando EmailJS
async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  try {
    if (process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID && process.env.EMAILJS_PUBLIC_KEY && process.env.EMAILJS_PRIVATE_KEY) {
      console.log(`[EMAILJS] Intentando enviar a ${email}...`);
      
      const payload = {
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        accessToken: process.env.EMAILJS_PRIVATE_KEY,
        template_params: {
          to_email: email,
          code: code,
          user_email: email,
          to_name: email.split('@')[0],
        },
      };

      console.log(`[EMAILJS] Enviando con Private Key...`);

      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log(`[EMAILJS] Response Status: ${response.status}`);
      console.log(`[EMAILJS] Response Body:`, responseText);

      if (!response.ok) {
        try {
          const errorData = JSON.parse(responseText);
          console.error(`[EMAILJS] ❌ Error ${response.status}:`, errorData);
        } catch {
          console.error(`[EMAILJS] ❌ Error ${response.status}: ${responseText}`);
        }
        return false;
      }

      console.log(`[EMAILJS] ✅ Email enviado exitosamente a ${email}`);
      return true;
    }

    // Desarrollo: mostrar en consola
    console.log(`✉️ [EMAIL SIM] ${email} → Código: ${code}`);
    return true;
  } catch (error) {
    console.error("[EMAILJS] Error al enviar email:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "El correo es requerido" }, { status: 400 });
    }

    // Normalizar email a minúsculas
    const normalizedEmail = email.toLowerCase();

    // Generar y guardar código en memoria
    const { code } = await saveVerificationCode(normalizedEmail);

    // Enviar email
    await sendVerificationEmail(normalizedEmail, code);

    return NextResponse.json({
      success: true,
      message: "Se ha enviado un código a tu correo electrónico",
    });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message || "Error al enviar el código" }, { status: 500 });
  }
}


