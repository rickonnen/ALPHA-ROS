/** Dev: Alvarado Alisson Dalet - xdev/sow-AlissonA
 * Fecha: 28/03/2026
 * Funcionalidad: GET /backend/paises
 *  Retorna todos los países disponibles para la combobox de editar perfil
 * @return {Array} - Lista de países con id_pais y nombre_pais ordenados alfabéticamente
 */
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function GET() {
  try {
    const arrPaises = await prisma.pais.findMany({
      select: {
        id_pais: true,
        nombre_pais: true,
        codigo_iso: true,
      },
      orderBy: { nombre_pais: "asc" },
    });
    return NextResponse.json({ data: arrPaises }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener países:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}