import nodemailer from "nodemailer";

/**
 * CRITERIO 19: Conectar Gmail con credenciales correctas
 * CRITERIO 21: Email remitente válido y coherente  
 * CRITERIO 23: Nombre plataforma como remitente
 */

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("❌ ERROR: Faltan credenciales de Gmail en .env");
  console.error("   Variables requeridas: EMAIL_USER, EMAIL_PASS");
}

export const emailConfig = {
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
  },
};

export const transporter = nodemailer.createTransport(emailConfig);

export async function verifyEmailConnection(): Promise<boolean> {
  try {
    console.log("Verificando conexión con Gmail...");
    await transporter.verify();
    console.log(" Conexión con Gmail verificada correctamente");
    return true;
  } catch (error) {
    console.error(
      " Error verificando conexión con Gmail:",
      error instanceof Error ? error.message : error
    );
    return false;
  }
}

export const emailSenderInfo = {
  address: process.env.EMAIL_FROM_ADDRESS || "",
  name: process.env.EMAIL_FROM_NAME || "PROPBOL Notificaciones",
};

export function getFormattedSender(): string {
  return `${emailSenderInfo.name} <${emailSenderInfo.address}>`;
}

if (process.env.NODE_ENV === "development") {
  console.log(" Configuración de email Alpha ROS:");
  console.log(`   Remitente: ${getFormattedSender()}`);
  console.log(`   Servicio: Gmail SMTP`);
}
