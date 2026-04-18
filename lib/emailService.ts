import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function enviarCodigoVerificacion(email: string, code: string, nombre: string): Promise<boolean> {
  try {
    console.log("[DEBUG] EMAIL_USER:", process.env.EMAIL_USER);
    console.log("[DEBUG] EMAIL_PASS:", process.env.EMAIL_PASS ? "existe" : "NO EXISTE");
    await transporter.sendMail({
      from: `"PROBOL" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Tu código de verificación - PROBOL",
      html: `
             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #C85A4F 0%, #B47B65 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0;">Verificación de Email</h1>
  </div>
  <div style="padding: 30px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-top: none;">
<p style="color: #374151; font-size: 16px; margin-bottom: 20px;">Hola ${nombre},</p>
    <p style="color: #374151; font-size: 14px; margin-bottom: 30px;">Para completar tu registro necesitas verificar tu dirección de correo.</p>
    <div style="background-color: white; border: 2px solid #C85A4F; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px;">
      <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0; text-transform: uppercase;">Código de verificación</p>
      <p style="color: #C85A4F; font-size: 36px; font-weight: bold; margin: 0; letter-spacing: 8px;">${code}</p>

    </div>
    <p style="color: #6b7280; font-size: 13px; text-align: center;">Este código expira en <strong>2 minutos</strong></p>
  </div>
</div>
            `,
    });
    console.log(`[NODEMAILER] ✅ Código enviado a ${email}`);
    return true;
  } catch (error) {
    console.error("[NODEMAILER] ❌ Error enviando código:", error);
    return false;
  }
}

export async function enviarBienvenida(email: string, nombre: string): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"PROBOL" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "¡Bienvenido a PROBOL!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #1a1a1a; border-radius: 12px; overflow: hidden;">
          <div style="background: #C85A4F; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">¡Bienvenido a PROBOL!</h1>
          </div>
          <div style="background: #1a1a1a; padding: 32px;">
            <p style="color: #ffffff; font-size: 16px; margin-bottom: 8px;">Hola, ${nombre} 👋</p>
            <p style="color: #cccccc; font-size: 15px; margin-bottom: 24px;">Tu cuenta ha sido creada exitosamente. Ya puedes acceder a la plataforma.</p>
            <div style="background: #111111; border: 1px solid #C85A4F; border-radius: 10px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <p style="color: #aaaaaa; font-size: 14px; margin: 0;">Estamos felices de tenerte en</p>
              <p style="color: #C85A4F; font-size: 32px; letter-spacing: 4px; margin: 8px 0; font-weight: bold;">PROBOL</p>
              <p style="color: #aaaaaa; font-size: 13px; margin: 0;">La plataforma de bolivarenses</p>
            </div>
            <p style="color: #888888; font-size: 12px; text-align: center;">Si no creaste esta cuenta, por favor contáctanos.</p>
          </div>
        </div>
      `,
    });
    console.log(`[NODEMAILER] ✅ Bienvenida enviada a ${email}`);
    return true;
  } catch (error) {
    console.error("[NODEMAILER] ❌ Error enviando bienvenida:", error);
    return false;
  }
}

export async function enviarBienvenidaGoogle(email: string, nombre: string): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"PROBOL" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "¡Bienvenido a PROBOL!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #1a1a1a; border-radius: 12px; overflow: hidden;">
          <div style="background: #C85A4F; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">¡Bienvenido a PROBOL!</h1>
          </div>
          <div style="background: #1a1a1a; padding: 32px;">
            <p style="color: #ffffff; font-size: 16px; margin-bottom: 8px;">Hola, ${nombre} 👋</p>
            <p style="color: #cccccc; font-size: 15px; margin-bottom: 24px;">Te has registrado exitosamente en PROBOL usando tu cuenta de Google.</p>
            <div style="background: #111111; border: 1px solid #C85A4F; border-radius: 10px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <p style="color: #aaaaaa; font-size: 14px; margin: 0;">Estamos felices de tenerte en</p>
              <p style="color: #C85A4F; font-size: 32px; letter-spacing: 4px; margin: 8px 0; font-weight: bold;">PROBOL</p>
              <p style="color: #aaaaaa; font-size: 13px; margin: 0;">La plataforma de bolivarenses</p>
            </div>
            <p style="color: #888888; font-size: 12px; text-align: center;">Si no creaste esta cuenta, por favor contáctanos.</p>
          </div>
        </div>
      `,
    });
    console.log(`[NODEMAILER] ✅ Bienvenida Google enviada a ${email}`);
    return true;
  } catch (error) {
    console.error("[NODEMAILER] ❌ Error enviando bienvenida Google:", error);
    return false;
  }
}