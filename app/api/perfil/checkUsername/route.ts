/** Dev: Alvarado Alisson Dalet - sow-AlissonA
 * Fecha: 22/04/2026
 * Funcionalidad: GET /api/perfil/checkUsername
 *   Verifica si un username ya está en uso por otro usuario distinto al actual
 */
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const strUsername  = searchParams.get("username")?.trim() ?? "";
  const strIdUsuario = searchParams.get("id_usuario") ?? "";

  if (!strUsername) {
    return NextResponse.json({ ocupado: false });
  }

  // Buscar
  const objExistente = await prisma.usuario.findFirst({
    where: {
      username: strUsername,
      NOT: { id_usuario: strIdUsuario },
    },
    select: { id_usuario: true },
  });

  return NextResponse.json({ ocupado: !!objExistente });
}

