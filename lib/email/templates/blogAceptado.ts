export function templateBlogAceptado(
  nombre: string,
  tituloBlog: string
): string {
  const fecha = new Date().toLocaleDateString("es-BO", {
    day: "numeric", month: "long", year: "numeric"
  });
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

        <div style="background:#1A5C38;padding:28px 24px;text-align:center;color:white;border-radius:10px;margin:0 24px">
          <h1 style="margin:0;font-size:22px;font-weight:700">Publicación Aprobada</h1>
          <p style="margin:8px 0 0 0;font-size:13px;opacity:0.9">Tu blog ya está visible en la plataforma</p>
        </div>

        <div style="padding:32px 48px;color:#333">
          <p style="margin:0 0 6px 0;font-size:15px">Hola, <strong>${nombre}</strong></p>
          <p style="margin:0 0 20px 0;font-size:12px;color:#999">${fecha}</p>
          <p style="margin:0 0 20px 0;font-size:14px;line-height:1.6">
            Tu publicación ha sido <strong>aprobada</strong> y ya se encuentra disponible en la plataforma.
            Ahora otros usuarios pueden verla y contactarte.
          </p>

          <div style="background:#F0FAF4;padding:16px;border-radius:8px;border-left:4px solid #1A5C38">
            <table style="width:100%;border-collapse:collapse">
              <tr>
                <td style="font-size:13px;color:#666;padding:4px 0;width:80px">Blog</td>
                <td style="font-size:13px;color:#333;font-weight:600">${tituloBlog}</td>
              </tr>
              <tr>
                <td style="font-size:13px;color:#666;padding:4px 0">Estado</td>
                <td style="font-size:13px;font-weight:700;color:#1A5C38">Visible ✓</td>
              </tr>
            </table>
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