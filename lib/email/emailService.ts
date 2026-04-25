import { transporter, getFormattedSender } from "./config";
import { validateRecipient, validateContentSafety } from "./validate";

interface SendEmailResult {
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

  // Validación 1: Email válido y destinatario presente
  const recipientValidation = validateRecipient(to);
  if (!recipientValidation.valid) {
    logEmailError(to, recipientValidation.error || "Email inválido", 0);
    return { success: false, timeTakenMs: 0, error: recipientValidation.error, attempts: 0 };
  }

  // Validación 2: Contenido seguro (sin contraseñas ni datos sensibles)
  const contentValidation = validateContentSafety(html);
  if (!contentValidation.valid) {
    logEmailError(to, contentValidation.error || "Contenido no seguro", 0);
    return { success: false, timeTakenMs: 0, error: contentValidation.error, attempts: 0 };
  }

  // Reintentos automáticos
  for (attempts = 1; attempts <= maxRetries; attempts++) {
    try {
      const info = await transporter.sendMail({
        from: getFormattedSender(),
        to,
        subject,
        html,
        headers: {
          "X-Mailer": "PROBOL Email Service",
          "X-Priority": "3",
          "Importance": "Normal",
          "X-MSMail-Priority": "Normal",
        },
      });

      const timeTakenMs = Date.now() - startTime;

      console.log(
        `✅ [EMAIL] Enviado a ${to} en ${timeTakenMs}ms (intento ${attempts}/${maxRetries})`
      );

      return {
        success: true,
        messageId: info.messageId,
        timeTakenMs,
        attempts,
      };
    } catch (error) {
      lastError =
        error instanceof Error ? error.message : "Error desconocido";

      // Si es el último intento, registrar el error
      if (attempts === maxRetries) {
        const timeTakenMs = Date.now() - startTime;
        logEmailError(to, lastError, timeTakenMs);
        console.error(
          `❌ [EMAIL] Fallo definitivo después de ${maxRetries} intentos a ${to}:`,
          lastError
        );

        return {
          success: false,
          timeTakenMs,
          error: lastError,
          attempts,
        };
      }

      // Esperar antes de reintentar (backoff exponencial)
      const delayMs = Math.min(1000 * Math.pow(2, attempts - 1), 5000);
      console.warn(
        `⚠️ [EMAIL] Error en intento ${attempts}/${maxRetries}. Reintentando en ${delayMs}ms...`,
        lastError
      );

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return {
    success: false,
    timeTakenMs: Date.now() - startTime,
    error: lastError || "Error desconocido",
    attempts,
  };
}

/**
 * TAREA 12: Registra errores de email en logs
 * TAREA 19: Mensaje de error cuando falla el envío
 */
function logEmailError(
  recipient: string,
  error: string | undefined,
  timeTakenMs: number
): void {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] EMAIL_ERROR | To: ${recipient} | Error: ${error} | Time: ${timeTakenMs}ms`;

  console.error(`❌ [EMAIL LOG] ${logMessage}`);

  // TODO: Guardar en base de datos (tabla EmailLog) para auditoría
  // await logEmailErrorToDatabase({ recipient, error, timeTakenMs, timestamp });
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
  
  
  const ahora = new Date();
  const fecha = ahora.toLocaleDateString('es-BO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const html = `
    <!DOCTYPE html>
    <html lang="es" style="margin:0;padding:0">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cambio de Contraseña - PROBOL</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif">
      <div style="background-color:#f5f5f5;padding:20px;min-height:100vh;display:flex;align-items:center;justify-content:center">
        <div style="max-width:600px;width:100%;background:white;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.1);overflow:hidden">
          <!-- Header -->
          <div style="background:linear-gradient(135deg,#C85A4F 0%,#B47B65 100%);padding:40px 24px;text-align:center;color:white">
            <h1 style="margin:0;font-size:28px;font-weight:600;letter-spacing:-0.5px">🔒 Seguridad Actualizada</h1>
            <p style="margin:8px 0 0 0;font-size:14px;opacity:0.9">Tu contraseña ha sido modificada</p>
          </div>
          
          <!-- Contenido -->
          <div style="padding:32px 24px;color:#333">
            <!-- Saludo -->
            <p style="margin:0 0 20px 0;font-size:16px;color:#1a1a1a">
              Hola, <strong>${nombre}</strong> 👋
            </p>
            
            <!-- Mensaje principal -->
            <div style="background:#f8f9fa;border-left:4px solid #C85A4F;padding:16px;margin:20px 0;border-radius:4px">
              <p style="margin:0;font-size:15px;color:#222;line-height:1.6">
                Tu contraseña ha sido <strong>actualizada exitosamente</strong> en tu cuenta de PROBOL.
              </p>
            </div>
            
            <!-- Fecha del evento -->
            <div style="background:#fff8f7;border:1px solid #FFE5E1;padding:12px 16px;margin:20px 0;border-radius:6px">
              <p style="margin:0;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.5px">
                📅 Fecha del evento
              </p>
              <p style="margin:8px 0 0 0;font-size:14px;color:#C85A4F;font-weight:600">
                ${fecha}
              </p>
            </div>
            
            <!-- Alerta de seguridad -->
            <div style="background:#fff3cd;border-left:4px solid #FF6B6B;padding:16px;margin:20px 0;border-radius:4px">
              <p style="margin:0;font-size:13px;color:#721c24;font-weight:600">
                ⚠️ ALERTA DE SEGURIDAD
              </p>
              <p style="margin:8px 0 0 0;font-size:13px;color:#721c24;line-height:1.5">
                Si <strong>no realizaste este cambio</strong>, contacta a nuestro equipo de soporte inmediatamente en: <strong>soporte@propbol.com</strong>
              </p>
            </div>
            
            <!-- CTA Botón "Ver Detalle" -->
            <div style="text-align:center;margin:30px 0">
              <a href="https://propbol.com/perfil/seguridad" 
                 target="_blank"
                 rel="noopener noreferrer"
                 style="display:inline-block;background:linear-gradient(135deg,#C85A4F 0%,#B47B65 100%);color:white;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:600;font-size:15px;transition:transform 0.2s;box-shadow:0 2px 4px rgba(200,90,79,0.2)">
                👁️ Ver Detalles de Seguridad
              </a>
            </div>
            
            <!-- Información adicional -->
            <div style="background:#f5f5f5;padding:16px;margin:20px 0;border-radius:6px;border:1px solid #e0e0e0">
              <p style="margin:0;font-size:12px;color:#666;line-height:1.6">
                <strong>¿Qué cambió?</strong> Tu nueva contraseña está protegida con encriptación de nivel empresarial. Nunca compartas tu contraseña con nadie.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background:#f9f9f9;padding:20px 24px;border-top:1px solid #e0e0e0;text-align:center;color:#666;font-size:12px">
            <p style="margin:0 0 8px 0">
              © 2026 PROBOL • La plataforma de bolivarenses
            </p>
            <p style="margin:0;color:#999;font-size:11px">
              Este es un email automático, no respondas a este mensaje.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const asunto = `🔒 Tu contraseña fue actualizada en PROBOL - ${ahora.toLocaleDateString('es-BO')}`;
  
  return sendEmail(email, asunto, html);
}

export const sendPasswordChangeEmail = enviarCambioContrasena;

/**
 * TAREA 6: Exportar sendEmail como función genérica reutilizable
 * Permite que otros módulos envíen correos personalizados
 * 
 * Ejemplo de uso:
 * ```
 * const result = await sendGenericEmail(
 *   'usuario@email.com',
 *   'Asunto del correo',
 *   '<p>HTML del correo</p>',
 *   3 // número de reintentos
 * );
 * 
 * if (result.success) {
 *   console.log('Email enviado:', result.messageId);
 * } else {
 *   console.error('Error:', result.error);
 * }
 * ```
 */
export async function sendGenericEmail(
  to: string,
  subject: string,
  html: string,
  maxRetries: number = 3
): Promise<SendEmailResult> {
  return sendEmail(to, subject, html, maxRetries);
}
export async function enviarRecuperacionContrasena(email: string, code: string, nombre: string): Promise<SendEmailResult> {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#C85A4F 0%,#B47B65 100%);padding:20px;text-align:center;border-radius:8px 8px 0 0">
        <h1 style="color:white;margin:0">Recuperación de contraseña</h1>
      </div>
      <div style="padding:30px;background-color:#f9fafb;border:1px solid #e5e7eb;border-top:none">
        <p style="color:#374151;font-size:16px">Hola ${nombre},</p>
        <p style="color:#374151;font-size:14px">Solicitaste recuperar tu contraseña en PropBol.</p>
        <div style="background-color:white;border:2px solid #C85A4F;padding:20px;text-align:center;border-radius:8px;margin:20px 0">
          <p style="color:#6b7280;font-size:12px;margin:0 0 10px 0;text-transform:uppercase">Código de verificación</p>
          <p style="color:#C85A4F;font-size:36px;font-weight:bold;margin:0;letter-spacing:8px">${code}</p>
        </div>
        <p style="color:#6b7280;font-size:13px;text-align:center">Este código expira en <strong>8 minutos</strong></p>
        <p style="color:#6b7280;font-size:13px;text-align:center">Si no solicitaste esto, ignora este mensaje.</p>
      </div>
    </div>
  `;
  return sendEmail(email, "Recuperación de contraseña - PropBol", html);
}

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

  const resultado = await sendEmail(
    email,
    `[${grupo.toUpperCase()}] ${titulo}`,
    html
  );

  return resultado;
}

export type { SendEmailResult };
