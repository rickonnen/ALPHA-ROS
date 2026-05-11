import { transporter, getFormattedSender } from "@/lib/email/config";
import { templatePagoRechazado } from "@/lib/email/templates/pagoRechazado";

export async function enviarEmailRechazo(datos: {
  emailCliente: string,
  emailAdmin: string,
  nombreCliente: string,
  plan: string,
  motivo: string
}) {
  const htmlRechazo = templatePagoRechazado(
    datos.nombreCliente,
    datos.plan,
    datos.motivo
  );

  return await transporter.sendMail({
    from: getFormattedSender(),
    to: datos.emailCliente,
    bcc: datos.emailAdmin,
    subject: `⚠️ Aviso sobre la verificación de tu pago - ${datos.plan}`,
    html: htmlRechazo,
  });
}