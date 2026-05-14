import { transporter, getFormattedSender } from "@/lib/email/config";
import { templateRecordatorioPlan } from "@/lib/email/templates/templateRecordatorioPlan";

export async function enviarEmailRecordatorio(datos: {
  emailCliente: string,
  nombreCliente: string,
  plan: string,
  tipo: '7D' | '48H' 
}) {
  const htmlRecordatorio = templateRecordatorioPlan(
    datos.nombreCliente,
    datos.plan,
    datos.tipo
  );

  const sujetos = {
    '7D': `⚠️ Aviso: Tu plan vence en 7 días - Propbol`,
    '48H': `⏳ Segundo Recordatorio: Tu plan vence en 5 días - Propbol`
  };

  return await transporter.sendMail({
    from: getFormattedSender(),
    to: datos.emailCliente,
    subject: sujetos[datos.tipo],
    html: htmlRecordatorio
  });
}