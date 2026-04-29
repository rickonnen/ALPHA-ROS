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
  
  // 1. Preparamos el HTML para el CLIENTE (Cercano y amable)
  const htmlCliente = templatePagoProcesado(
    datos.nombreCliente,
    datos.plan,
    "Mensual", 
    datos.monto,
    datos.cupos
  );

  // 2. Preparamos el HTML para el ADMINISTRADOR (Informativo y formal)
  // Nota: Aquí podrías crear un template nuevo, pero para ahorrar tiempo
  // modificamos ligeramente el mensaje principal.
  const htmlAdmin = `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border: 1px solid #eee;">
      <h2 style="color: #1F3A4D;">Reporte de Gestión: Pago Aprobado</h2>
      <p>Se ha procesado una nueva transacción en la plataforma:</p>
      <ul>
        <li><strong>Cliente:</strong> ${datos.nombreCliente}</li>
        <li><strong>Plan:</strong> ${datos.plan}</li>
        <li><strong>Monto:</strong> $${datos.monto} USD</li>
        <li><strong>Fecha:</strong> ${new Date().toLocaleString()}</li>
      </ul>
      <p>El comprobante adjunto ha sido enviado automáticamente al cliente.</p>
      <hr />
      <p style="font-size: 11px; color: #999;">PROPBOL - Sistema de Administración</p>
    </div>
  `;

  // --- EJECUCIÓN DE ENVÍOS (Criterio 5: Envío dual) ---

  // Envío 1: Al Cliente
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

  // Envío 2: Al Administrador
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
  
  return resultados[0]; // Retornamos el resultado del envío al cliente para la lógica del route.ts
}