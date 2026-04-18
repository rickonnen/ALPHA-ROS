import nodemailer from 'nodemailer';

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  timeTakenMs: number;
  error?: string;
}

// Crear transportador de Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * TAREA-EMAIL-02: Envía un correo de cambio de contraseña
 * Mide el tiempo de envío y verifica que sea menor a 10 segundos
 * 
 * @param recipientEmail - Email del destinatario
 * @param userName - Nombre del usuario
 * @returns Resultado con messageId, tiempo y estado
 */
export async function sendPasswordChangeEmail(
  recipientEmail: string,
  userName: string
): Promise<SendEmailResult> {
  const startTime = Date.now();

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: recipientEmail,
      subject: 'Tu contraseña ha sido actualizada',
      html: `
        <h2>Cambio de Contraseña</h2>
        <p>Hola ${userName},</p>
        <p>Tu contraseña ha sido actualizada exitosamente.</p>
        <p>Si no realizaste este cambio, contacta a soporte inmediatamente.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    const timeTakenMs = Date.now() - startTime;

    console.log(`✅ Email enviado en ${timeTakenMs}ms a ${recipientEmail}`);

    return {
      success: true,
      messageId: info.messageId,
      timeTakenMs,
    };
  } catch (error) {
    const timeTakenMs = Date.now() - startTime;
    console.error(`❌ Error enviando email en ${timeTakenMs}ms:`, error);

    return {
      success: false,
      timeTakenMs,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
