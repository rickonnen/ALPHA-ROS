import { transporter, getFormattedSender } from "./config";
import { validateRecipient } from "./validate";

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  timeTakenMs: number;
  error?: string;
}

async function sendEmail(to: string, subject: string, html: string): Promise<SendEmailResult> {
  const startTime = Date.now();
  const validation = validateRecipient(to);
  if (!validation.valid) {
    return { success: false, timeTakenMs: 0, error: validation.error };
  }
  try {
    const info = await transporter.sendMail({ from: getFormattedSender(), to, subject, html });
    const timeTakenMs = Date.now() - startTime;
    console.log(`✅ [EMAIL] Enviado a ${to} en ${timeTakenMs}ms`);
    return { success: true, messageId: info.messageId, timeTakenMs };
  } catch (error) {
    const timeTakenMs = Date.now() - startTime;
    console.error(`❌ [EMAIL] Error enviando a ${to}:`, error);
    return { success: false, timeTakenMs, error: error instanceof Error ? error.message : "Error desconocido" };
  }
}

export async function enviarCodigoVerificacion(email: string, code: string, nombre: string): Promise<SendEmailResult> {
  return sendEmail(email, "Tu código de verificación - PROBOL", `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:linear-gradient(135deg,#C85A4F 0%,#B47B65 100%);padding:20px;text-align:center;border-radius:8px 8px 0 0"><h1 style="color:white;margin:0">Verificación de Email</h1></div><div style="padding:30px;background-color:#f9fafb;border:1px solid #e5e7eb;border-top:none"><p style="color:#374151;font-size:16px">Hola ${nombre},</p><p style="color:#374151;font-size:14px">Para completar tu registro necesitas verificar tu dirección de correo.</p><div style="background-color:white;border:2px solid #C85A4F;padding:20px;text-align:center;border-radius:8px;margin-bottom:20px"><p style="color:#6b7280;font-size:12px;margin:0 0 10px 0;text-transform:uppercase">Código de verificación</p><p style="color:#C85A4F;font-size:36px;font-weight:bold;margin:0;letter-spacing:8px">${code}</p></div><p style="color:#6b7280;font-size:13px;text-align:center">Este código expira en <strong>2 minutos</strong></p></div></div>`);
}

export async function enviarBienvenida(email: string, nombre: string): Promise<SendEmailResult> {
  return sendEmail(email, "¡Bienvenido a PROBOL!", `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#1a1a1a;border-radius:12px;overflow:hidden"><div style="background:#C85A4F;padding:24px;text-align:center"><h1 style="color:white;margin:0;font-size:24px">¡Bienvenido a PROBOL!</h1></div><div style="background:#1a1a1a;padding:32px"><p style="color:#ffffff;font-size:16px">Hola, ${nombre} 👋</p><p style="color:#cccccc;font-size:15px">Tu cuenta ha sido creada exitosamente.</p><div style="background:#111111;border:1px solid #C85A4F;border-radius:10px;padding:24px;text-align:center;margin-bottom:24px"><p style="color:#aaaaaa;font-size:14px;margin:0">Estamos felices de tenerte en</p><p style="color:#C85A4F;font-size:32px;letter-spacing:4px;margin:8px 0;font-weight:bold">PROBOL</p><p style="color:#aaaaaa;font-size:13px;margin:0">La plataforma de bolivarenses</p></div><p style="color:#888888;font-size:12px;text-align:center">Si no creaste esta cuenta, por favor contáctanos.</p></div></div>`);
}

export async function enviarBienvenidaGoogle(email: string, nombre: string): Promise<SendEmailResult> {
  return sendEmail(email, "¡Bienvenido a PROBOL!", `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#1a1a1a;border-radius:12px;overflow:hidden"><div style="background:#C85A4F;padding:24px;text-align:center"><h1 style="color:white;margin:0;font-size:24px">¡Bienvenido a PROBOL!</h1></div><div style="background:#1a1a1a;padding:32px"><p style="color:#ffffff;font-size:16px">Hola, ${nombre} 👋</p><p style="color:#cccccc;font-size:15px">Te registraste exitosamente usando tu cuenta de Google.</p><div style="background:#111111;border:1px solid #C85A4F;border-radius:10px;padding:24px;text-align:center;margin-bottom:24px"><p style="color:#aaaaaa;font-size:14px;margin:0">Estamos felices de tenerte en</p><p style="color:#C85A4F;font-size:32px;letter-spacing:4px;margin:8px 0;font-weight:bold">PROBOL</p><p style="color:#aaaaaa;font-size:13px;margin:0">La plataforma de bolivarenses</p></div><p style="color:#888888;font-size:12px;text-align:center">Si no creaste esta cuenta, por favor contáctanos.</p></div></div>`);
}

export async function enviarCambioContrasena(email: string, nombre: string): Promise<SendEmailResult> {
  return sendEmail(email, "Tu contraseña ha sido actualizada - PROBOL", `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#1a1a1a;border-radius:12px;overflow:hidden"><div style="background:#C85A4F;padding:24px;text-align:center"><h1 style="color:white;margin:0;font-size:24px">Cambio de Contraseña</h1></div><div style="background:#1a1a1a;padding:32px"><p style="color:#ffffff;font-size:16px">Hola, ${nombre} 👋</p><p style="color:#cccccc;font-size:15px">Tu contraseña ha sido actualizada exitosamente.</p><p style="color:#aaaaaa;font-size:13px">Si no realizaste este cambio, contacta a soporte inmediatamente.</p></div></div>`);
}

export const sendPasswordChangeEmail = enviarCambioContrasena;
