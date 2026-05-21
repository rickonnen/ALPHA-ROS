export function templateReactivacionPorSoporte(nombre: string): string {
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
          <h1 style="margin:0;font-size:22px;font-weight:700">¡Cuenta Reactivada!</h1>
          <p style="margin:8px 0 0 0;font-size:13px;opacity:0.8">Tu cuenta ha sido reactivada exitosamente</p>
        </div>

        <!-- Cuerpo -->
        <div style="padding:32px 48px;color:#333">
          <p style="margin:0 0 24px 0;font-size:15px">Hola, <strong>${nombre}</strong> 👋</p>
          <p style="margin:0 0 24px 0;font-size:14px;color:#333;line-height:1.6">
            Tu cuenta ha sido reactivada exitosamente por nuestro equipo de soporte.
            Ya puedes iniciar sesión y acceder a todos los servicios de <strong>PROPBOL</strong>.
          </p>

          <div style="text-align:center;padding:20px 0">
            <a href="${process.env.NEXTAUTH_URL}/"
               style="display:inline-block;background:#1F3A4D;color:white;padding:14px 44px;text-decoration:none;border-radius:20px;font-weight:600;font-size:15px">
              Iniciar Sesión
            </a>
          </div>

          <p style="margin:24px 0 0 0;font-size:13px;color:#666;line-height:1.6">
            Si no solicitaste la reactivación, contacta inmediatamente a soporte:
            <a href="mailto:soportepropbol@gmail.com" style="color:#1F3A4D">soportepropbol@gmail.com</a>
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
}
