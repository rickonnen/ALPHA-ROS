import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Obtener userId del query parameter
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId es requerido" },
        { status: 400 }
      );
    }

    // Obtener estado de 2FA del usuario
    const usuario = await (prisma.usuario.findUnique as any)({
      where: { id_usuario: userId },
      select: {
        dos_fa_habilitado: true,
      },
    }).catch(() => null);

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      dos_fa_habilitado: usuario.dos_fa_habilitado || false,
    });
  } catch (error) {
    console.error("[ESTADO 2FA] Error:", error);
    return NextResponse.json(
      { error: "Error al obtener estado de 2FA" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
