import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/auth/check-2fa-status
 * Verifica si el usuario actual tiene 2FA habilitado
 * Requiere sesión de NextAuth
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const userId = session.user.id as string;
    console.log(`[CHECK 2FA] Verificando estado de 2FA para usuario: ${userId}`);

    // Obtener datos de 2FA del usuario
    const usuario = await (prisma.usuario.findUnique as any)({
      where: { id_usuario: userId },
      select: {
        id_usuario: true,
        dos_fa_habilitado: true,
        dos_fa_secreto: true,
        email: true,
      },
    }).catch((e: any) => {
      console.error("[CHECK 2FA] Error en findUnique:", e.message);
      return null;
    });

    if (!usuario) {
      console.error(`[CHECK 2FA] Usuario no encontrado: ${userId}`);
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const requires2FA =
      usuario.dos_fa_habilitado === true && usuario.dos_fa_secreto;

    console.log(
      `[CHECK 2FA] Usuario ${usuario.email} - 2FA requerido: ${requires2FA}`
    );

    return NextResponse.json({
      requires2FA: requires2FA || false,
      userId: usuario.id_usuario,
    });
  } catch (error) {
    console.error("[CHECK 2FA] Error:", error);
    return NextResponse.json(
      { error: "Error al verificar 2FA" },
      { status: 500 }
    );
  }
}
