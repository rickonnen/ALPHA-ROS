export function templatePagoRechazado(
  nombre: string,
  plan: string,
  motivo: string
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

        <!-- Header (Color Rojo para Advertencia) -->
        <div style="background:#B91C1C;padding:28px 24px;text-align:center;color:white;border-radius:10px;margin:0 24px">
          <h1 style="margin:0;font-size:22px;font-weight:700">Pago no Verificado</h1>
          <p style="margin:8px 0 0 0;font-size:13px;opacity:0.9">Tu comprobante ha sido rechazado</p>
        </div>

        <!-- Cuerpo -->
        <div style="padding:32px 48px;color:#333">
          <p style="margin:0 0 24px 0;font-size:15px">Hola, <strong>${nombre}</strong> 👋</p>
          <p style="margin:0 0 24px 0;font-size:14px;color:#333;line-height:1.6">
            Lamentamos informarte que no hemos podido validar tu pago para el plan <strong>${plan}</strong> debido a un inconveniente con el comprobante enviado.
          </p>

          <!-- Cuadro de Motivo de Rechazo -->
          <div style="background:#FEF2F2;padding:16px;border-radius:8px;margin:20px 0;border-left:4px solid #B91C1C; border: 1px solid #FECACA">
            <p style="margin:0 0 8px 0;font-size:12px;color:#B91C1C;font-weight:700;text-transform:uppercase">Motivo del rechazo:</p>
            <p style="margin:0;font-size:15px;color:#991B1B">"${motivo}"</p>
          </div>

          <p style="margin:24px 0 16px 0;font-size:14px;color:#666;line-height:1.6">
            Para activar tu suscripción, por favor revisa el motivo mencionado y vuelve a subir tu comprobante de pago
          </p>

          <div style="text-align:center;padding:16px 0">
            <a href="${process.env.NEXTAUTH_URL}/home"
               style="display:inline-block;background:#1F3A4D;color:white;padding:12px 32px;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px">
              Volver a subir comprobante
            </a>
          </div>

          <p style="margin:24px 0 0 0;font-size:12px;color:#999;border-top:1px solid #eee;padding-top:16px">
            Si crees que esto es un error o necesitas ayuda, contacta a soporte
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}