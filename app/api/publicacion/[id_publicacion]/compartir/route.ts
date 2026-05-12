/**
 * @Dev: Marcela C.
 * @Fecha: 10/05/2026
 * @Funcionalidad: Endpoint de la API para registrar las veces que un inmueble
 * fue compartido. Utiliza la función 'upsert' para sumar +1 a la fecha actual
 * o crear un nuevo registro si es la primera compartida del día en hora local (Bolivia).
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

    const fechaBoliviaStr = new Date().toLocaleString("en-US", { timeZone: "America/La_Paz" });
    const hoyLocal = new Date(fechaBoliviaStr);

    const hoy = new Date(Date.UTC(hoyLocal.getFullYear(), hoyLocal.getMonth(), hoyLocal.getDate()));

    await prisma.estadisticaPublicacion.upsert({
      where: {
        id_publicacion_fecha: { id_publicacion: intId, fecha: hoy },
      },
      update: { compartidas: { increment: 1 } },
      create: {
        id_publicacion: intId,
        fecha: hoy,
        vistas: 0,
        compartidas: 1,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error registrando compartida:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}