/**
 * Template: Código de Verificación
 *  app/api/auth/send-verification-code/route.ts
 */
export function templateVerificacion(nombre: string, code: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#C85A4F 0%,#B47B65 100%);padding:20px;text-align:center;border-radius:8px 8px 0 0">
        <h1 style="color:white;margin:0">Verificación de Email</h1>
      </div>

      <!-- Cuerpo -->
      <div style="padding:30px;background-color:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
        <p style="color:#374151;font-size:16px">Hola ${nombre},</p>
        <p style="color:#374151;font-size:14px">
          Para completar tu registro necesitas verificar tu dirección de correo.
        </p>

        <!-- Código -->
        <div style="background-color:white;border:2px solid #C85A4F;padding:20px;text-align:center;border-radius:8px;margin-bottom:20px">
          <p style="color:#6b7280;font-size:12px;margin:0 0 10px 0;text-transform:uppercase">
            Código de verificación
          </p>
          <p style="color:#C85A4F;font-size:36px;font-weight:bold;margin:0;letter-spacing:8px">
            ${code}
          </p>
        </div>

        <p style="color:#6b7280;font-size:13px;text-align:center">
          Este código expira en <strong>2 minutos</strong>
        </p>
      </div>

    </div>
  `;
}