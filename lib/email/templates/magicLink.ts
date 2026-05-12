/**
 * Template: Magic Link de Autenticación
 *  app/api/auth/magic-link/route.ts
 */
export function templateMagicLink(nombre: string, magicLinkUrl: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es" style="margin:0;padding:0">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background-color:#f9fafb;font-family:'Segoe UI',Arial,sans-serif">
      <div style="max-width:600px;margin:0 auto;background:white;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08)">

        <!-- Logo Header -->
        <div style="background:linear-gradient(135deg,#1F3A4D 0%,#2d5a6f 100%);padding:30px 24px;text-align:center">
          <img src="https://res.cloudinary.com/dxy43tgpy/image/upload/f_auto,q_auto/logo-principal_jxkvja" 
               alt="PROPBOL" style="height:50px;vertical-align:middle" />
          <span style="font-size:24px;font-weight:800;color:white;vertical-align:middle;margin-left:10px">Propbol</span>
        </div>

        <!-- Main Content -->
        <div style="padding:40px 32px">
          <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#1F3A4D">
            ¡Tu Magic Link está listo! ✨
          </h1>
          
          <p style="margin:0 0 24px 0;font-size:15px;color:#4b5563;line-height:1.6">
            Hola ${nombre},
          </p>
          
          <p style="margin:0 0 32px 0;font-size:14px;color:#4b5563;line-height:1.6">
            Hicimos clic en el botón de abajo para iniciar sesión en PROPBOL de forma segura:
          </p>

          <!-- CTA Button -->
          <div style="text-align:center;margin:32px 0">
            <a href="${magicLinkUrl}"
               style="display:inline-block;background:linear-gradient(135deg,#C85A4F 0%,#B47B65 100%);color:white;padding:16px 48px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(200,90,79,0.3)">
              Iniciar Sesión Seguro
            </a>
          </div>

          <!-- Info Box -->
          <div style="background:#f0f9ff;border-left:4px solid #1F3A4D;padding:16px;border-radius:4px;margin:32px 0">
            <p style="margin:0;font-size:13px;color:#1F3A4D;font-weight:600">
               Este link expira en 15 minutos
            </p>
            <p style="margin:8px 0 0 0;font-size:12px;color:#4b5563">
              Si no solicitaste este link, puedes ignorar este email de forma segura.
            </p>
          </div>

          <!-- Alternative Link (in case button doesn't work) -->
          <p style="margin:24px 0 8px 0;font-size:12px;color:#9ca3af">
            Si el botón anterior no funciona, copia y pega este enlace en tu navegador:
          </p>
          <p style="margin:0;font-size:12px;color:#1F3A4D;word-break:break-all;background:#f3f4f6;padding:12px;border-radius:4px">
            ${magicLinkUrl}
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 32px;text-align:center">
          <p style="margin:0 0 8px 0;font-size:12px;color:#6b7280">
            © 2026 PROPBOL. Todos los derechos reservados.
          </p>
          <p style="margin:0;font-size:11px;color:#9ca3af">
            <a href="mailto:soporte@propbol.com" style="color:#1F3A4D;text-decoration:none">Contactar Soporte</a>
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
}