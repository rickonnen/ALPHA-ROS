export function templateRecordatorioPlan(
  nombre: string,
  plan: string,
  fechaFin: string,
  tipo: '7D' | '5D' | '48H'
): string {
 
  const config = {
    '7D': { titulo: "¡Aviso de Vencimiento!", sub: "Tu plan vence en 7 días", color: "#1F3A4D" },
    '5D': { titulo: "Recordatorio de Pago", sub: "Faltan solo 5 días", color: "#D97706" }, 
    '48H': { titulo: "Plan Vencido", sub: "Tu suscripción ha expirado", color: "#B91C1C" } 
  };

  const { titulo, sub, color } = config[tipo];

  return `
    <!DOCTYPE html>
    <html lang="es">
    <body style="margin:0;padding:0;background-color:#ffffff;font-family:'Segoe UI',Arial,sans-serif">
      <div style="max-width:600px;margin:0 auto;background:white">
        <!-- Logo -->
        <div style="padding:30px 0 24px 0;text-align:center">
          <img src="https://res.cloudinary.com/dxy43tgpy/image/upload/f_auto,q_auto/logo-principal_jxkvja" 
               alt="PROPBOL" style="height:60px;vertical-align:middle" />
          <span style="font-size:26px;font-weight:800;color:#1F3A4D;vertical-align:middle;margin-left:10px">Propbol</span>
        </div>

        <!-- Header Dinámico -->
        <div style="background:${color};padding:28px 24px;text-align:center;color:white;border-radius:10px;margin:0 24px">
          <h1 style="margin:0;font-size:22px;font-weight:700">${titulo}</h1>
          <p style="margin:8px 0 0 0;font-size:13px;opacity:0.9">${sub}</p>
        </div>

        <!-- Cuerpo -->
        <div style="padding:32px 48px;color:#333">
          <p style="margin:0 0 24px 0;font-size:15px">Hola, <strong>${nombre}</strong> 👋</p>
          <p style="margin:0 0 24px 0;font-size:14px;line-height:1.6">
            Te informamos que tu plan <strong>${plan}</strong> tiene como fecha de finalización el <strong>${fechaFin}</strong>.
          </p>

          <div style="background:#f0f4f8;padding:16px;border-radius:8px;margin:20px 0;border-left:4px solid ${color}">
             <p style="margin:0;font-size:14px;color:#333">
               ${tipo === '48H' 
                 ? 'Tus anuncios han sido pausados. Renueva ahora para reactivarlos.' 
                 : 'Evita interrupciones en tus publicaciones realizando tu pago a tiempo.'}
             </p>
          </div>

          <div style="text-align:center;padding:16px 0">
            <a href="${process.env.NEXTAUTH_URL}/home"
               style="display:inline-block;background:${color};color:white;padding:12px 32px;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px">
              ${tipo === '48H' ? 'Renovar Plan' : 'Ir a mi cuenta'}
            </a>
          </div>

          <p style="margin:24px 0 0 0;font-size:12px;color:#999;border-top:1px solid #eee;padding-top:16px;text-align:center">
            Propbol - Soluciones Inmobiliarias
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}