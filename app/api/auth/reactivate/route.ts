import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "El correo electrónico es requerido" },
        { status: 400 }
      );
    }

    // 1. Buscar el usuario en auth.users
    const authUser = await prisma.users.findFirst({
      where: {
        email: email,
      },
    });

    if (!authUser) {
      return NextResponse.json(
        { error: "No se encontró una cuenta con este correo" },
        { status: 404 }
      );
    }

    // 2. FORZAR reactivación - limpiar TODOS los campos que puedan desactivar la cuenta
    const reactivatedUser = await prisma.users.update({
      where: { id: authUser.id },
      data: {
        deleted_at: null,
        banned_until: null,
        updated_at: new Date(),
      },
    });

    // 3. Actualizar también en la tabla Usuario de public
    const publicUser = await prisma.usuario.findFirst({
      where: { id_usuario: authUser.id },
    });

    if (publicUser) {
      await prisma.usuario.update({
        where: { id_usuario: authUser.id },
        data: {
          estado: 1, // Activar cuenta (1 = activo)
        },
      });
    }

    // 4. Limpiar sesiones antiguas para forzar un nuevo login limpio
    await prisma.sessions.deleteMany({
      where: { user_id: authUser.id },
    });

    // 5. También limpiar refresh tokens
    await prisma.refresh_tokens.deleteMany({
      where: { user_id: authUser.id },
    });

    return NextResponse.json({
      success: true,
      message: "Cuenta reactivada exitosamente. Ya puedes iniciar sesión.",
      user: {
        id: reactivatedUser.id,
        email: reactivatedUser.email,
      },
    });
  } catch (error) {
    console.error("Error reactivating account:", error);
    return NextResponse.json(
      { error: "Error al reactivar la cuenta. Intenta nuevamente." },
      { status: 500 }
    );
  }
}