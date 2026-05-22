import { transporter, getFormattedSender } from "@/lib/email/config";
import { templateRecordatorioPlan } from "@/lib/email/templates/templateRecordatorioPlan";
import { emailNotificacionesActivas } from "@/lib/notifications/emailPreferencia";
import { prisma } from "@/lib/prisma";

export async function enviarEmailRecordatorio(datos: {
  emailCliente: string,
  nombreCliente: string,
  plan: string,
  tipo: '7D' | '48H'
}) {
  try {
    const usuario = await prisma.usuario.findFirst({
      where: { email: datos.emailCliente },
      select: { id_usuario: true }
    });

    if (usuario) {
      const puedeEnviar = await emailNotificacionesActivas(usuario.id_usuario);
      if (!puedeEnviar) {
        console.log(`[Recordatorio] Email desactivado para ${datos.emailCliente}, se omite.`);
        return null;
      }
    }
  } catch (err) {
    console.error("[Recordatorio] Error verificando preferencia:", err);
  }

  const htmlRecordatorio = templateRecordatorioPlan(
    datos.nombreCliente,
    datos.plan,
    datos.tipo
  );

  const sujetos = {
    '7D': `⚠️ Aviso: Tu plan vence en 7 días - Propbol`,
    '48H': `⏳ Segundo Recordatorio: Tu plan vence en 2 días - Propbol`
  };

  return await transporter.sendMail({
    from: getFormattedSender(),
    to: datos.emailCliente,
    subject: sujetos[datos.tipo],
    html: htmlRecordatorio
  });
}