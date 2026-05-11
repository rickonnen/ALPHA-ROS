// HU-05: Template para notificar a soporte sobre solicitud de reactivación
export function templateSolicitudReactivacion(
  emailUsuario: string,
  tipoCuenta: string,
  motivo: string,
  fechaSolicitud: string
): string {
  return `
    <!DOCTYPE html>
    <html lang="es" style="margin:0;padding:0">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif">
      <div style="padding:30px 20px">
        <div style="max-width:520px;margin:0 auto;background:white;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
          <!-- Header logo -->
          <div style="padding:16px 24px;text-align:center;border-bottom:1px solid #eee">
            <span style="font-size:20px;font-weight:700;color:#1a1a2e"><span style="color:#C85A4F">Prop</span>bol</span>
          </div>
          <!-- Banner -->
          <div style="background:#1F3A4D;padding:28px 24px;text-align:center">
            <h1 style="margin:0;font-size:20px;font-weight:700;color:white">🔔 Solicitud de Reactivación de Cuenta</h1>
            <p style="margin:6px 0 0 0;font-size:13px;color:rgba(255,255,255,0.8)">Panel de Soporte Técnico</p>
          </div>
          <!-- Body -->
          <div style="padding:28px 24px;color:#333">
            <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6">
              Un usuario ha solicitado la reactivación de su cuenta desactivada. Por favor, revisa los datos a continuación y procede a activar la cuenta desde el panel de administración si corresponde.
            </p>
            <!-- Datos del usuario -->
            <div style="background:#f8f9fa;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin-bottom:20px">
              <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1px">Datos de la solicitud</p>
              <table style="width:100%;border-collapse:collapse;margin-top:12px">
                <tr>
                  <td style="padding:8px 0;font-size:13px;color:#666;width:140px;vertical-align:top">Email del usuario:</td>
                  <td style="padding:8px 0;font-size:13px;font-weight:700;color:#1F3A4D">${emailUsuario}</td>
                </tr>
                <tr style="border-top:1px solid #eee">
                  <td style="padding:8px 0;font-size:13px;color:#666;vertical-align:top">Tipo de cuenta:</td>
                  <td style="padding:8px 0;font-size:13px;font-weight:600;color:#333">${tipoCuenta}</td>
                </tr>
                <tr style="border-top:1px solid #eee">
                  <td style="padding:8px 0;font-size:13px;color:#666;vertical-align:top">Motivo (opcional):</td>
                  <td style="padding:8px 0;font-size:13px;color:#333">${motivo || "No especificado"}</td>
                </tr>
                <tr style="border-top:1px solid #eee">
                  <td style="padding:8px 0;font-size:13px;color:#666;vertical-align:top">Fecha de solicitud:</td>
                  <td style="padding:8px 0;font-size:13px;color:#333">${fechaSolicitud}</td>
                </tr>
              </table>
            </div>
            <!-- Aviso -->
            <div style="background:#FEF9EC;border-left:4px solid #F59E0B;border-radius:0 6px 6px 0;padding:14px 16px;margin-bottom:20px">
              <p style="margin:0;font-size:13px;color:#92400E;line-height:1.5">
                <strong>⏱ Tiempo de respuesta:</strong> El usuario espera una respuesta en un plazo máximo de 24 horas.
              </p>
            </div>
            <p style="margin:0;font-size:12px;color:#999;text-align:center;line-height:1.5">
              Este es un mensaje automático del sistema PROPBOL.<br>No respondas a este correo directamente.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}