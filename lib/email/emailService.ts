import { transporter, getFormattedSender } from "./config";
import { validateRecipient, validateContentSafety } from "./validate";
import { templateVerificacion } from "./templates/verificacion";
import { templateBienvenida } from "./templates/bienvenida";
import { templateBienvenidaGoogle } from "./templates/bienvenidaGoogle";
import { templateCambioContrasena } from "./templates/cambioContrasena";
import { templateRecuperacionContrasena } from "./templates/recuperacionContrasena";
import { templatePagoProcesado } from "./templates/pagoProcesado"

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  timeTakenMs: number;
  error?: string;
  attempts?: number;
}
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  maxRetries: number = 3
): Promise<SendEmailResult> {
  const startTime = Date.now();
  let lastError: string | undefined;
  let attempts = 0;

  // Validar destinatario
  const recipientValidation = validateRecipient(to);
  if (!recipientValidation.valid) {
    logEmailError(to, recipientValidation.error || "Email inválido", 0);
    return { success: false, timeTakenMs: 0, error: recipientValidation.error, attempts: 0 };
  }

  // Validar contenido seguro (sin contraseñas ni datos sensibles)
  const contentValidation = validateContentSafety(html);
  if (!contentValidation.valid) {
    logEmailError(to, contentValidation.error || "Contenido no seguro", 0);
    return { success: false, timeTakenMs: 0, error: contentValidation.error, attempts: 0 };
  }

  // Reintentos con backoff exponencial
  for (attempts = 1; attempts <= maxRetries; attempts++) {
    try {
      const info = await transporter.sendMail({
        from: getFormattedSender(),
        to,
        subject,
        html,
        headers: {
          "X-Mailer": "PROPBOL Email Service",
          "X-Priority": "3",
          "Importance": "Normal",
          "X-MSMail-Priority": "Normal",
        },
      });

      const timeTakenMs = Date.now() - startTime;
      console.log(` [EMAIL] Enviado a ${to} en ${timeTakenMs}ms (intento ${attempts}/${maxRetries})`);

      return { success: true, messageId: info.messageId, timeTakenMs, attempts };

    } catch (error) {
      lastError = error instanceof Error ? error.message : "Error desconocido";

      if (attempts === maxRetries) {
        const timeTakenMs = Date.now() - startTime;
        logEmailError(to, lastError, timeTakenMs);
        console.error(` [EMAIL] Fallo definitivo después de ${maxRetries} intentos a ${to}:`, lastError);
        return { success: false, timeTakenMs, error: lastError, attempts };
      }

      const delayMs = Math.min(1000 * Math.pow(2, attempts - 1), 5000);
      console.warn(` [EMAIL] Error en intento ${attempts}/${maxRetries}. Reintentando en ${delayMs}ms...`, lastError);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return { success: false, timeTakenMs: Date.now() - startTime, error: lastError || "Error desconocido", attempts };
}


function logEmailError(recipient: string, error: string | undefined, timeTakenMs: number): void {
  const timestamp = new Date().toISOString();
  console.error(` [EMAIL LOG] [${timestamp}] EMAIL_ERROR | To: ${recipient} | Error: ${error} | Time: ${timeTakenMs}ms`);
  // TODO: Guardar en tabla EmailLog para auditoría
}
/** Código de verificación al registrarse */
export async function enviarCodigoVerificacion(
  email: string,
  code: string,
  nombre: string
): Promise<SendEmailResult> {
  return sendEmail(
    email,
    "Tu código de verificación - PROPBOL",
    templateVerificacion(nombre, code)
  );
}
/** Bienvenida para registro normal (email + contraseña) */
export async function enviarBienvenida(
  email: string,
  nombre: string
): Promise<SendEmailResult> {
  return sendEmail(
    email,
    "¡Bienvenido a PROPBOL!",
    templateBienvenida(nombre)
  );
}
/** Bienvenida para registro con Google OAuth */
export async function enviarBienvenidaGoogle(
  email: string,
  nombre: string
): Promise<SendEmailResult> {
  return sendEmail(
    email,
    "¡Bienvenido a PROPBOL!",
    templateBienvenidaGoogle(nombre)
  );
}

/** Notificación de cambio de contraseña */
export async function enviarCambioContrasena(
  email: string,
  nombre: string
): Promise<SendEmailResult> {
  const ahora = new Date();
  const fecha = ahora.toLocaleDateString("es-BO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return sendEmail(
    email,
    `Tu contraseña fue actualizada en PROBOL - ${ahora.toLocaleDateString("es-BO")}`,
    templateCambioContrasena(nombre, fecha)
  );
}
// Alias para compatibilidad con imports existentes
export const sendPasswordChangeEmail = enviarCambioContrasena;

/** Email genérico reutilizable para otros módulos */
export async function sendGenericEmail(
  to: string,
  subject: string,
  html: string,
  maxRetries: number = 3
): Promise<SendEmailResult> {
  return sendEmail(to, subject, html, maxRetries);
}

// EL frontend de Notificacion de Discord// POR AHORA
export async function enviarDiscordVinculado(
  email: string,
  nombre: string
): Promise<SendEmailResult> {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
      <div style="background:linear-gradient(135deg,#7289DA 0%,#5a73c4 100%);padding:24px;text-align:center">
        <h1 style="color:white;margin:0;font-size:24px"> Discord Vinculado</h1>
      </div>
      <div style="background:#ffffff;padding:32px">
        <p style="color:#1a1a1a;font-size:16px">Hola, ${nombre} 👋</p>
        <p style="color:#444444;font-size:15px">Tu cuenta de Discord ha sido vinculada exitosamente con PROPBOL.</p>
        <div style="background:#f9fafb;border:2px solid #7289DA;border-radius:10px;padding:24px;text-align:center;margin-bottom:24px">
          <p style="color:#666666;font-size:14px;margin:0">Ahora puedes iniciar sesión con</p>
          <p style="color:#7289DA;font-size:32px;letter-spacing:2px;margin:8px 0;font-weight:bold">DISCORD</p>
        </div>
        <p style="color:#999999;font-size:12px;text-align:center">Si no realizaste esta vinculación, accede a tu cuenta inmediatamente.</p>
      </div>
    </div>
  `
  return sendEmail(email, "Tu Discord está vinculado - PROPBOL", html)
}
export async function enviarRecuperacionContrasena(
  email: string,
  codigo: string,
  nombre: string
): Promise<SendEmailResult> {
  return sendEmail(
    email,
    "Recupera tu contraseña - PROPBOL",
    templateRecuperacionContrasena(nombre, codigo)
  );
}

export async function enviarConfirmacionPago(
  email: string,
  nombre: string,
  plan: string,
  frecuencia: string,
  monto: number,
  cupos: number
): Promise<SendEmailResult> {
  return sendEmail(
    email,
    `Tu pago de $${monto} ha sido confirmado - PROPBOL`,
    templatePagoProcesado(nombre, plan, frecuencia, monto, cupos)
  );
}


///AREGLARRRRRRRRR DE COBROS 

export async function enviarNotificacionDeGrupo(
  email: string,
  nombre: string,
  titulo: string,
  mensaje: string,
  grupo: string,
  id_notificacion: string
): Promise<SendEmailResult> {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#C85A4F 0%,#B47B65 100%);padding:20px;text-align:center;border-radius:8px 8px 0 0">
        <h1 style="color:white;margin:0">Notificación de ${grupo}</h1>
      </div>
      <div style="padding:30px;background:#f9fafb;border:1px solid #e5e7eb">
        <p style="color:#374151;font-size:16px">Hola ${nombre},</p>
        <h2 style="color:#C85A4F">${titulo}</h2>
        <p style="color:#374151;font-size:15px">${mensaje}</p>
        <p style="color:#999;font-size:12px;margin-top:30px">
          Mensaje enviado por el grupo de <strong>${grupo}</strong> en PROBOL.
        </p>
      </div>
      <div style="background:#f9f9f9;padding:20px;border-top:1px solid #e0e0e0;text-align:center">
        <p style="color:#999;font-size:11px;margin:0">
          © 2026 PROBOL • Este es un mensaje automático, no respondas este correo.
        </p>
      </div>
    </div>
  `;
  return sendEmail(email, `[${grupo.toUpperCase()}] ${titulo}`, html);
}
/////////////////////hasta aqui 