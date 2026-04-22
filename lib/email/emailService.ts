import { transporter, getFormattedSender } from "./config";
import { validateRecipient, validateContentSafety } from "./validate";
import { templateVerificacion } from "./templates/verificacion";
import { templateBienvenida } from "./templates/bienvenida";
import { templateBienvenidaGoogle } from "./templates/bienvenidaGoogle";
import { templateCambioContrasena } from "./templates/cambioContrasena";


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