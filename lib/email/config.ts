import nodemailer from "nodemailer";



// Validar variables de entorno requeridas
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD;
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "PROBOL Notificaciones";
if (!GMAIL_USER || !GMAIL_PASSWORD) {
  console.warn(
    "⚠️ [EMAIL CONFIG] Variables GMAIL_USER o GMAIL_PASSWORD no configuradas. Los emails no se enviarán."
  );
}

export const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true para 465, false para 587
  requireTls: true,
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASSWORD, // Debe ser App Password, no contraseña regular
  },
  // Configuración para evitar spam
  connectionUrl: undefined,
  connectionTimeout: 10000,
  socketTimeout: 15000,
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 10,
});


export function getFormattedSender(): string {
  return `"${EMAIL_FROM_NAME}" <${GMAIL_USER}>`;
}


export async function verifyEmailConnection(): Promise<{
  connected: boolean;
  error?: string;
}> {
  try {
    if (!GMAIL_USER || !GMAIL_PASSWORD) {
      return {
        connected: false,
        error: "Credenciales de email no configuradas",
      };
    }

    await transporter.verify();
    console.log(" [EMAIL] Conexión SMTP verificada correctamente");
    return { connected: true };
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("[EMAIL] Error verificando conexión SMTP:", errorMsg);
    return { connected: false, error: errorMsg };
  }
}

/**
 * Cierra el transporter cuando no se necesite más
 */
export async function closeEmailConnection(): Promise<void> {
  try {
    await transporter.close();
    console.log(" [EMAIL] Conexión SMTP cerrada");
  } catch (error) {
    console.error(" [EMAIL] Error cerrando conexión SMTP:", error);
  }
}
