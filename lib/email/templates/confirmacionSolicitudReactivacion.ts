// HU-05 CA-9: Template confirmación al usuario de que su solicitud fue recibida
export function templateConfirmacionSolicitudReactivacion(
  emailUsuario: string
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
          <span style="font-size:26px;font-weight:800;color:#1F3A4D;vertical-align:middle;margin-left:10px;font-family:'Segoe UI',Arial,sans-serif">Propbol</span>
        </div>

        <!-- Header -->
        <div style="background:#1F3A4D;padding:28px 24px;text-align:center;color:white;border-radius:10px;margin:0 24px">
<h1 style="margin:0;font-size:22px;font-weight:700">¡Solicitud Recibida!/h1>         
 <p style="margin:8px 0 0 0;font-size:13px;opacity:0.8">Reactivación de cuenta</p>
        </div>
        
          <!-- Body -->
          <div style="padding:28px 24px;color:#333">
            <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6">
              Hola, hemos recibido tu solicitud para reactivar la cuenta asociada a:
            </p>
            <!-- Email destacado -->
            <div style="background:#EAE3D9;border-radius:8px;padding:14px 18px;margin-bottom:20px;text-align:center">
              <p style="margin:0;font-size:14px;font-weight:700;color:#1F3A4D">${emailUsuario}</p>
            </div>
            <!-- Tiempo de respuesta -->
            <div style="background:#f8f9fa;border:1px solid #e2e8f0;border-radius:8px;padding:18px;margin-bottom:20px">
              <p style="margin:0 0 8px 0;font-size:13px;font-weight:700;color:#333">¿Qué pasa ahora?</p>
              <ul style="margin:0;padding:0 0 0 18px;font-size:13px;color:#555;line-height:1.8">
                <li>Nuestro equipo de soporte revisará tu solicitud.</li>
                <li>Recibirás una respuesta en un plazo <strong>máximo de 24 horas</strong>.</li>
                <li>Cuando tu cuenta sea reactivada, recibirás otro correo de confirmación.</li>
              </ul>
            </div>
            <!-- Aviso reenvío -->
            <div style="background:#EFF6FF;border-left:4px solid #3B82F6;border-radius:0 6px 6px 0;padding:12px 16px;margin-bottom:20px">
              <p style="margin:0;font-size:12px;color:#1E40AF;line-height:1.5">
                Si no recibes respuesta en 24 horas, puedes reenviar la solicitud desde el login de PROPBOL usando la opción "¿Deseas reactivar tu cuenta?".
              </p>
            </div>
            <p style="margin:0;font-size:12px;color:#999;text-align:center;line-height:1.5">
              Si no solicitaste esto, puedes ignorar este correo.<br>
              © 2026 PROPBOL · Este es un mensaje automático.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
