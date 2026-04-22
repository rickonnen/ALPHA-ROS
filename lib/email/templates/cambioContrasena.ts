/**
 * Template: Notificación de cambio de contraseña
 * Usado en: app/api/auth/change-password/route.ts
 */
export function templateCambioContrasena(nombre: string, fecha: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es" style="margin:0;padding:0">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cambio de Contraseña - PROPBOL</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif">
      <div style="background-color:#f5f5f5;padding:20px">
        <div style="max-width:600px;width:100%;margin:0 auto;background:white;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.1);overflow:hidden">

          <!-- Header -->
          <div style="background:linear-gradient(135deg,#C85A4F 0%,#B47B65 100%);padding:40px 24px;text-align:center;color:white">
            <h1 style="margin:0;font-size:28px;font-weight:600;letter-spacing:-0.5px"> Seguridad Actualizada</h1>
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
                Tu contraseña ha sido <strong>actualizada exitosamente</strong> en tu cuenta de PROPBOL.
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
                Si <strong>no realizaste este cambio</strong>, contacta a nuestro equipo de soporte 
                inmediatamente en: <strong>soporte@propbol.com</strong>
              </p>
            </div>

            <!-- Botón CTA -->
            <div style="text-align:center;margin:30px 0">
              <a href="https://propbol.com/perfil/seguridad"
                 target="_blank"
                 rel="noopener noreferrer"
                 style="display:inline-block;background:linear-gradient(135deg,#C85A4F 0%,#B47B65 100%);color:white;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:600;font-size:15px;box-shadow:0 2px 4px rgba(200,90,79,0.2)">
                🔍 Ver Detalles de Seguridad
              </a>
            </div>

            <!-- Info adicional -->
            <div style="background:#f5f5f5;padding:16px;margin:20px 0;border-radius:6px;border:1px solid #e0e0e0">
              <p style="margin:0;font-size:12px;color:#666;line-height:1.6">
                <strong>¿Qué cambió?</strong> Tu nueva contraseña está protegida con encriptación 
                de nivel empresarial. Nunca compartas tu contraseña con nadie.
              </p>
            </div>

          </div>

          <!-- Footer -->
          <div style="background:#f9f9f9;padding:20px 24px;border-top:1px solid #e0e0e0;text-align:center;color:#666;font-size:12px">
            <p style="margin:0 0 8px 0">© 2026 PROPBOL • Gracias por tu elección</p>
            <p style="margin:0;color:#999;font-size:11px">
              Este es un email automático, no respondas a este mensaje.
            </p>
          </div>

        </div>
      </div>
    </body>
    </html>
  `;
}