/**
 * @Dev: Gustavo Montaño
 * @Fecha: 09/05/2026
 * @Funcionalidad: Endpoint de la API para registrar automáticamente las vistas de un inmueble.
 * Utiliza la función 'upsert' para sumar +1 a la fecha actual o crear un 
 * nuevo registro si es la primera visita del día en hora local (Bolivia).
 * @param {Request} request - Objeto de la petición HTTP entrante.
 * @param {Promise<{ id_publicacion: string }>} params - Promesa con el parámetro de la URL.
 * @return {NextResponse} Respuesta JSON indicando el éxito o fallo de la operación.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id_publicacion: string }> }
) {
  try {
    const { id_publicacion } = await params;
    const intId = parseInt(id_publicacion, 10);
    if (isNaN(intId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    // Obtenemos la hora actual exactamente en Bolivia (La Paz / Cochabamba)
    const fechaBoliviaStr = new Date().toLocaleString("en-US", { timeZone: "America/La_Paz" });
    const hoyLocal = new Date(fechaBoliviaStr);
    // Lo empaquetamos a las 00:00:00 en formato UTC puro para guardarlo en la Base de Datos
    const hoy = new Date(Date.UTC(hoyLocal.getFullYear(), hoyLocal.getMonth(), hoyLocal.getDate()));
    //Si existe suma 1, si no, lo crea.
    await prisma.estadisticaPublicacion.upsert({
      where: {
        id_publicacion_fecha: { id_publicacion: intId, fecha: hoy },
      },
      update: { vistas: { increment: 1 } },
      create: {
        id_publicacion: intId,
        fecha: hoy,
        vistas: 1,
        compartidas: 0, //solo cambiará esto en el API de compartidos
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error registrando vista:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}