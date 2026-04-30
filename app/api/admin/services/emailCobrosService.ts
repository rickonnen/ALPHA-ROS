import { transporter, getFormattedSender } from "@/lib/email/config";
import { templatePagoProcesado } from "@/lib/email/templates/pagoProcesado";

export async function enviarEmailCobroConPDF(datos: {
  emailCliente: string,
  emailAdmin: string, 
  nombreCliente: string,
  plan: string,
  monto: number,
  cupos: number,
  pdfBuffer: Buffer
}) {
  const htmlCliente = templatePagoProcesado(
    datos.nombreCliente,
    datos.plan,
    "Mensual", 
    datos.monto,
    datos.cupos
  );

  return await transporter.sendMail({
    from: getFormattedSender(),
    to: datos.emailCliente,
    bcc: datos.emailAdmin,
    subject: `✅ ¡Tu pago ha sido aprobado! - ${datos.plan}`,
    html: htmlCliente, 
    attachments: [
      {
        filename: `comprobante_pago.pdf`,
        content: datos.pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  });
}