export function templateRecuperacionContrasena(nombre: string, codigo: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es" style="margin:0;padding:0">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background-color:#f0f0f0;font-family:'Segoe UI',Arial,sans-serif">
      <div style="padding:30px 20px">
        <div style="max-width:480px;margin:0 auto;background:white;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
          <div style="padding:24px;text-align:center;background:white;border-bottom:1px solid #eee">
            <span style="font-size:22px;font-weight:700;color:#1a1a2e">🏠 <span style="color:#C85A4F">Prop</span>bol</span>
          </div>
          <div style="background:#1a2744;padding:32px 24px;text-align:center;color:white">
            <h1 style="margin:0;font-size:24px;font-weight:700">Recuperación de Contraseña</h1>
            <p style="margin:8px 0 0 0;font-size:13px;opacity:0.8">Código de verificación</p>
          </div>
          <div style="padding:28px 24px;color:#333">
            <p style="margin:0 0 16px 0;font-size:15px">Hola, <strong>${nombre}</strong> 👋</p>
            <p style="margin:0 0 20px 0;font-size:14px;color:#444;line-height:1.6">
              Recibimos una solicitud para recuperar tu contraseña. Usa este código:
            </p>
            <div style="background:#f9f9f9;border:2px solid #C85A4F;border-radius:10px;padding:24px;text-align:center;margin-bottom:20px">
              <p style="margin:0;font-size:13px;color:#999">Tu código de recuperación</p>
              <p style="margin:8px 0 0 0;font-size:40px;font-weight:700;color:#C85A4F;letter-spacing:8px">${codigo}</p>
              <p style="margin:8px 0 0 0;font-size:12px;color:#999">Expira en 8 minutos</p>
            </div>
            <div style="background:#fff3cd;border-left:4px solid #f0ad4e;padding:14px 16px;border-radius:4px">
              <p style="margin:0;font-size:13px;color:#856404;line-height:1.5">
                Si <strong>no solicitaste esto</strong>, ignora este email. Tu cuenta sigue segura.
              </p>
            </div>
          </div>
          <div style="background:#f9f9f9;padding:16px 24px;border-top:1px solid #eee;text-align:center">
            <p style="margin:0;font-size:11px;color:#999">© 2026 PROPBOL · Este es un email automático, no respondas.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}