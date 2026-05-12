export function templateRecordatorioPlan(
  nombre: string,
  plan: string,
  fechaFin: string,
  tipo: '7D' | '5D' | '48H'
): string {
  const fecha = new Date().toLocaleDateString("es-BO", {
    day: "numeric", month: "long", year: "numeric"
  });

  const config = {
    '7D': { 
      titulo: "Plan por Finalizar", 
      sub: "Tu suscripción está próximamente a vencer", 
      color: "#AF5D4A",
      mensaje: `Tu plan actual <strong>${plan}</strong> está por <strong>finalizar en los próximos 7 días</strong> (${fechaFin}). Te recomendamos renovarlo para seguir disfrutando de todas las funcionalidades de PROPBOL.`,
      alerta: "No pierdas visibilidad en tus publicaciones. Renueva ahora para mantener tu cuenta activa.",
      boton: "Renovar mi plan"
    },
    '5D': { 
      titulo: "Recordatorio de Pago", 
      sub: "Faltan solo 5 días para el vencimiento", 
      color: "#AF5D4A",
      mensaje: `Tu plan <strong>${plan}</strong> vence el <strong>${fechaFin}</strong>. Solo faltan 5 días — renueva ahora para no perder el acceso a tus publicaciones.`,
      alerta: "No pierdas visibilidad en tus publicaciones. Renueva ahora para mantener tu cuenta activa.",
      boton: "Renovar mi plan"
    },
    '48H': { 
      titulo: "Plan Vencido", 
      sub: "Tu suscripción ha expirado", 
      color: "#9B2335",
      mensaje: `Tu plan <strong>${plan}</strong> ha <strong>expirado</strong>. Tus publicaciones han sido pausadas hasta que renueves tu suscripción.`,
      alerta: "Renueva ahora para reactivar tus anuncios y volver a ser visible en la plataforma.",
      boton: "Renovar Plan"
    }
  };

  const { titulo, sub, color, mensaje, alerta, boton } = config[tipo];

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

        <div style="background:${color};padding:28px 24px;text-align:center;color:white;border-radius:10px;margin:0 24px">
          <h1 style="margin:0;font-size:22px;font-weight:700">${titulo}</h1>
          <p style="margin:8px 0 0 0;font-size:13px;opacity:0.9">${sub}</p>
        </div>

        <div style="padding:32px 48px;color:#333">
          <p style="margin:0 0 6px 0;font-size:15px">Hola, <strong>${nombre}</strong></p>
          <p style="margin:0 0 20px 0;font-size:12px;color:#999">${fecha}</p>
          <p style="margin:0 0 20px 0;font-size:14px;line-height:1.6">${mensaje}</p>

          <div style="background:#FBF3F1;padding:16px;border-radius:8px;border-left:4px solid ${color}">
            <p style="margin:0 0 6px 0;font-size:12px;color:${color};font-weight:700;text-transform:uppercase">Alerta de Vencimiento</p>
            <p style="margin:0;font-size:13px;color:#555">${alerta}</p>
          </div>

          <div style="text-align:center;padding:16px 0">
            <a href="https://alpha-ros-deploy.vercel.app/cobros/planes"
               style="display:inline-block;background:${color};color:white;padding:12px 32px;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px">
              ${boton}
            </a>
          </div>

        <p style="margin:0;font-size:12px;color:#999;border-top:1px solid #eee;padding-top:16px;text-align:left">
           Si tienes preguntas, contacta a soporte: <a href="mailto:soportepropbol@gmail.com" style="color:#1F3A4D;text-decoration:none;font-weight:600">soportepropbol@gmail.com</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}