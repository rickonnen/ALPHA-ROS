export function templateNotificacionAdmin(
  nombreCliente: string,
  emailCliente: string,
  plan: string,
  monto: number,
  fecha: string
): string {
  return `
    <!DOCTYPE html>
    <html lang="es" style="margin:0;padding:0">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background-color:#ffffff;font-family:'Segoe UI',Arial,sans-serif">
      <div style="max-width:600px;margin:0 auto;background:white">

        <div style="padding:30px 0 24px 0;text-align:center">
          <img src="https://res.cloudinary.com/dxy43tgpy/image/upload/f_auto,q_auto/logo-principal_jxkvja" 
               alt="PROPBOL" style="height:60px;vertical-align:middle" />
          <span style="font-size:26px;font-weight:800;color:#1F3A4D;vertical-align:middle;margin-left:10px">Propbol</span>
        </div>

        <div style="background:#1F3A4D;padding:28px 24px;text-align:center;color:white;border-radius:10px;margin:0 24px">
          <h1 style="margin:0;font-size:22px;font-weight:700">Notificación de Venta</h1>
          <p style="margin:8px 0 0 0;font-size:13px;opacity:0.8">Se ha procesado un nuevo ingreso</p>
        </div>

        <div style="padding:32px 48px;color:#333">
          <p style="margin:0 0 24px 0;font-size:15px">Hola, <strong>Administrador</strong> 👋</p>
          <p style="margin:0 0 24px 0;font-size:14px;color:#333;line-height:1.6">
            Se ha validado exitosamente un pago mediante el panel administrativo. Aquí los detalles del cliente:
          </p>

          <div style="background:#f0f4f8;padding:16px;border-radius:8px;margin:20px 0;border-left:4px solid #B47B65">
            <p style="margin:0 0 8px 0;font-size:12px;color:#666;font-weight:700;text-transform:uppercase">Resumen de transacción:</p>
            <p style="margin:0 0 4px 0;font-size:14px;color:#333"><strong>Cliente:</strong> ${nombreCliente}</p>
            <p style="margin:0 0 4px 0;font-size:14px;color:#333"><strong>Email:</strong> ${emailCliente}</p>
            <p style="margin:0 0 4px 0;font-size:14px;color:#333"><strong>Plan Activado:</strong> ${plan}</p>
            <p style="margin:0 0 4px 0;font-size:14px;color:#333"><strong>Monto Recibido:</strong> $${monto} USD</p>
            <p style="margin:0 0 4px 0;font-size:14px;color:#333"><strong>Fecha/Hora:</strong> ${fecha}</p>
          </div>

          <p style="margin:24px 0 16px 0;font-size:13px;color:#666;line-height:1.6">
            El comprobante PDF ha sido generado y enviado automáticamente al correo del cliente. No se requiere ninguna acción adicional.
          </p>

          <div style="text-align:center;padding:16px 0">
            <a href="${process.env.NEXTAUTH_URL}/admin/verificacion-pagos"
               style="display:inline-block;background:#1F3A4D;color:white;padding:12px 32px;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px">
              Ver panel de administración
            </a>
          </div>

          <p style="margin:24px 0 0 0;font-size:11px;color:#bbb;text-align:center;border-top:1px solid #eee;padding-top:16px">
            PROPBOL ERP - Sistema de Notificaciones Automáticas
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
}