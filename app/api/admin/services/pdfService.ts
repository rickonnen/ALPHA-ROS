import { jsPDF } from "jspdf";

/**
 * Genera un comprobante de pago en PDF
 * @param datos Objeto con la información del pago y del usuario
 * @returns Buffer del PDF generado
 */
export const generarComprobantePDF = async (datos: {
  id_detalle: string;
  nombre: string;
  plan: string;
  precio: number;
  cupos: number;
}) => {
  const doc = new jsPDF();

  // --- Encabezado con Estilo ---
  // Rectángulo oscuro en la parte superior (Color institucional #1F3A4D)
  doc.setFillColor(31, 58, 77);
  doc.rect(0, 0, 210, 40, "F");

  // Título Blanco
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("COMPROBANTE DE PAGO", 105, 25, { align: "center" });

  // --- Cuerpo del Documento ---
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("DETALLES DE LA TRANSACCIÓN", 20, 60);
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 65, 190, 65);

  // Información Dinámica
  doc.setFont("helvetica", "normal");
  const startY = 75;
  doc.text(`ID de Transacción: ${datos.id_detalle}`, 20, startY);
  doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, 20, startY + 10);
  doc.text(`Cliente: ${datos.nombre}`, 20, startY + 20);
  
  doc.line(20, 110, 190, 110);

  // Tabla de Concepto
  doc.setFont("helvetica", "bold");
  doc.text("CONCEPTO", 20, 120);
  doc.text("CUPOS", 130, 120);
  doc.text("TOTAL", 170, 120);
  
  doc.setFont("helvetica", "normal");
  doc.text(`Suscripción Plan ${datos.plan}`, 20, 130);
  doc.text(`${datos.cupos}`, 130, 130);
  doc.text(`${datos.precio} USD`, 170, 130);

  doc.line(20, 140, 190, 140);

  // Pie de página
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Este documento es un comprobante oficial de su compra en Propbol.", 105, 280, { align: "center" });

  // Generamos el ArrayBuffer y lo convertimos a Buffer de Node.js
  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
};