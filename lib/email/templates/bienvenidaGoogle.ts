/**
 * Template: Bienvenida registro con Google OAuth
 * app/api/auth/[...nextauth]/route.ts
 */
export function templateBienvenidaGoogle(nombre: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">

      <!-- Header -->
      <div style="background:#C85A4F;padding:24px;text-align:center">
        <h1 style="color:white;margin:0;font-size:24px">¡Bienvenido a PROPBOL!</h1>
      </div>

      <!-- Cuerpo -->
      <div style="background:#ffffff;padding:32px">
        <p style="color:#1a1a1a;font-size:16px">Hola, ${nombre} 👋</p>
        <p style="color:#444444;font-size:15px">Te registraste exitosamente usando tu cuenta de Google.</p>

        <!-- Caja destacada -->
        <div style="background:#f9fafb;border:2px solid #C85A4F;border-radius:10px;padding:24px;text-align:center;margin-bottom:24px">
          <p style="color:#666666;font-size:14px;margin:0">Estamos felices de tenerte en</p>
          <p style="color:#C85A4F;font-size:32px;letter-spacing:4px;margin:8px 0;font-weight:bold">PROPBOL</p>
          <p style="color:#666666;font-size:13px;margin:0">Gracias por tu elección</p>
        </div>

        <p style="color:#999999;font-size:12px;text-align:center">
          Si no creaste esta cuenta, por favor contáctanos.
        </p>
      </div>

    </div>
  `;
}