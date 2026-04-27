export function templateRecuperacionContrasena(nombre: string, codigo: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es" style="margin:0;padding:0">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background-color:#f5e6e6;font-family:'Segoe UI',Arial,sans-serif">
      <div style="padding:30px 20px">
        <div style="max-width:480px;margin:0 auto;background:white;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
          <div style="padding:16px 24px;text-align:center;border-bottom:1px solid #eee">
            <span style="font-size:20px;font-weight:700;color:#1a1a2e"><span style="color:#C85A4F">Prop</span>bol</span>
          </div>
          <div style="background:#C85A4F;padding:32px 24px;text-align:center">
            <h1 style="margin:0;font-size:22px;font-weight:700;color:white">Recuperación de Contraseña</h1>
            <p style="margin:6px 0 0 0;font-size:13px;color:rgba(255,255,255,0.85)">Código de verificación</p>
          </div>
          <div style="padding:28px 24px;color:#333">
            <p style="margin:0 0 8px 0;font-size:15px">Hola, <strong>${nombre}</strong></p>
            <p style="margin:0 0 20px 0;font-size:14px;color:#444;line-height:1.6">
              Recibimos una solicitud para recuperar tu clave de acceso. Usa este código:
            </p>
            <div style="background:white;border:2px solid #C85A4F;border-radius:10px;padding:24px;text-align:center;margin-bottom:16px">
              <p style="margin:0;font-size:12px;color:#999;letter-spacing:1px;text-transform:uppercase">Tu código de recuperación</p>
              <p style="margin:10px 0 0 0;font-size:42px;font-weight:700;color:#C85A4F;letter-spacing:10px">${codigo}</p>
              <p style="margin:8px 0 0 0;font-size:12px;color:#999">Expira en 8 minutos</p>
            </div>
            <p style="margin:0;font-size:13px;color:#333;text-align:center;line-height:1.5">
              Si <strong>no solicitaste esto</strong>, ignora este email. Tu cuenta sigue segura.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}