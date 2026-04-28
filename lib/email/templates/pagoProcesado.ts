export function templatePagoProcesado(
  nombre: string,
  plan: string,
  frecuencia: string,
  monto: number,
  cupos: number
): string {
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
          <span style="font-size:26px;font-weight:800;color:#1F3A4D;vertical-align:middle;margin-left:10px">Propbol</span>
        </div>

        <!-- Header -->
        <div style="background:#1F3A4D;padding:28px 24px;text-align:center;color:white;border-radius:10px;margin:0 24px">
          <h1 style="margin:0;font-size:22px;font-weight:700">¡Pago Confirmado!</h1>
          <p style="margin:8px 0 0 0;font-size:13px;opacity:0.8">Tu plan ha sido activado</p>
        </div>

        <!-- Cuerpo -->
        <div style="padding:32px 48px;color:#333">
          <p style="margin:0 0 24px 0;font-size:15px">Hola, <strong>${nombre}</strong> 👋</p>
          <p style="margin:0 0 24px 0;font-size:14px;color:#333;line-height:1.6">
            Tu pago de <strong>$${monto}</strong> para el plan <strong>${plan}</strong> (${frecuencia}) ha sido procesado exitosamente.
          </p>

          <!-- Detalles del plan -->
          <div style="background:#f0f4f8;padding:16px;border-radius:8px;margin:20px 0;border-left:4px solid #1F3A4D">
            <p style="margin:0 0 8px 0;font-size:12px;color:#666;font-weight:700;text-transform:uppercase">Detalles de tu plan:</p>
            <p style="margin:0 0 4px 0;font-size:16px;font-weight:700;color:#1F3A4D">${plan}</p>
            <p style="margin:0 0 8px 0;font-size:13px;color:#666">Frecuencia: ${frecuencia === 'mensual' ? 'Mensual (30 días)' : 'Anual (12 meses)'}</p>
            <p style="margin:0;font-size:13px;color:#666"> <strong>${cupos}</strong> cupos de publicación</p>
          </div>

          <p style="margin:24px 0 16px 0;font-size:13px;color:#666;line-height:1.6">
            Ya puedes usar todas las funciones del plan <strong>${plan}</strong>. Accede a tu cuenta en:
          </p>

          <div style="text-align:center;padding:16px 0">
            <a href="${process.env.NEXTAUTH_URL}/home"
               style="display:inline-block;background:#1F3A4D;color:white;padding:12px 32px;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px">
              Ir a mi cuenta
            </a>
          </div>

          <p style="margin:24px 0 0 0;font-size:12px;color:#999;border-top:1px solid #eee;padding-top:16px">
            Si tienes preguntas, contacta a soporte: 
            <a href="mailto:soporte@propbol.com" style="color:#1F3A4D;text-decoration:none">soporte@propbol.com</a>
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
}