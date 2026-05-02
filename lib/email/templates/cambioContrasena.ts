export function templateCambioContrasena(nombre: string, fecha: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es" style="margin:0;padding:0">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background-color:#ffffff;font-family:'Segoe UI',Arial,sans-serif">
      <div style="max-width:600px;margin:0 auto;background:white">

        <!-- Logo -->
        <div style="padding:30px 0 24px 0;text-align:center">
          <img src="https://res.cloudinary.com/dxy43tgpy/image/upload/f_auto,q_auto/logo-principal_jxkvja" 
               alt="PROPBOL" style="height:60px;vertical-align:middle" />
          <span style="font-size:26px;font-weight:800;color:#1F3A4D;vertical-align:middle;margin-left:10px;font-family:'Segoe UI',Arial,sans-serif">Propbol</span>
        </div>

        <!-- Header -->
        <div style="background:#1F3A4D;padding:28px 24px;text-align:center;color:white;border-radius:10px;margin:0 24px">
          <h1 style="margin:0;font-size:22px;font-weight:700">Seguridad Actualizada</h1>
          <p style="margin:8px 0 0 0;font-size:13px;opacity:0.8">Tu contraseña ha sido modificada</p>
        </div>

        <!-- Cuerpo -->
        <div style="padding:32px 48px;color:#333">

          <table style="width:100%;margin-bottom:16px;border-collapse:collapse">
            <tr>
              <td style="font-size:15px">Hola, <strong>${nombre}</strong></td>
              <td style="text-align:right;font-size:13px;color:#666">${fecha}</td>
            </tr>
          </table>

          <p style="margin:0 0 24px 0;font-size:14px;color:#333;line-height:1.6">
            Tu contraseña ha sido <strong>actualizada exitosamente</strong> en tu cuenta de PROPBOL
          </p>

          <p style="margin:0 0 6px 0;font-size:13px;color:#333;font-weight:700">ALERTA DE SEGURIDAD</p>
          <p style="margin:0;font-size:13px;color:#333;line-height:1.6">
            Si no realizaste este cambio, contacta a nuestro equipo de soporte inmediatamente en:
            <a href="mailto:soporte@propbol.com" style="color:#C85A4F">soporte@propbol.com</a>
          </p>

        </div>

      </div>
    </body>
    </html>
  `;
}