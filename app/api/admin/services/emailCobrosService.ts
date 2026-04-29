import { transporter, getFormattedSender } from "@/lib/email/config";
import { templatePagoProcesado } from "@/lib/email/templates/pagoProcesado";
import { templateNotificacionAdmin } from "@/lib/email/templates/notificacionAdmin"; // <-- Tu nueva importación

export async function enviarEmailCobroConPDF(datos: {
  emailCliente: string,
  emailAdmin: string, 
  nombreCliente: string,
  plan: string,
  monto: number,
  cupos: number,
  pdfBuffer: Buffer
}) {
  
  // cliente
  const htmlCliente = templatePagoProcesado(
    datos.nombreCliente,
    datos.plan,
    "Mensual", 
    datos.monto,
    datos.cupos
  );

  // admin
  const htmlAdmin = templateNotificacionAdmin(
    datos.nombreCliente,
    datos.emailCliente,
    datos.plan,
    datos.monto,
    new Date().toLocaleString('es-BO') 
  );

  // enviar gmails

  // Al Cliente
  const envioCliente = transporter.sendMail({
    from: getFormattedSender(),
    to: datos.emailCliente,
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

  // Al Administrador
  const envioAdmin = transporter.sendMail({
    from: getFormattedSender(),
    to: datos.emailAdmin,
    subject: `[ADMIN] Nueva Venta: ${datos.nombreCliente} - ${datos.plan}`,
    html: htmlAdmin,
    attachments: [
      {
        filename: `copia_comprobante_${datos.nombreCliente.replace(/\s+/g, '_')}.pdf`,
        content: datos.pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  });

  // Esperamos a que ambos se completen
  const resultados = await Promise.all([envioCliente, envioAdmin]);
  
  return resultados[0]; 
}