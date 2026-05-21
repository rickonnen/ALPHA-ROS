import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarReactivacionPorSoporte } from "@/lib/email/emailService";
/**
 * GET /api/admin/reactivacionPerfiles
 * Retorna la lista paginada de usuarios con estado = 0 (desactivados).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const intPage = parseInt(searchParams.get("page") || "1");
    const intLimit = parseInt(searchParams.get("limit") || "10");
    const intSkip = (intPage - 1) * intLimit;

    const [arrUsuarios, intTotal] = await Promise.all([
      prisma.usuario.findMany({
        where: { estado: 0 },
        select: {
          id_usuario: true,
          email: true,
          estado: true,
          fecha_desactivacion: true,
        },
        orderBy: { fecha_desactivacion: "desc" },
        skip: intSkip,
        take: intLimit,
      }),
      prisma.usuario.count({ where: { estado: 0 } }),
    ]);

    return NextResponse.json({
      data: arrUsuarios,
      page: intPage,
      totalPages: Math.ceil(intTotal / intLimit),
      total: intTotal,
    });
  } catch (error) {
    console.error("[GET /api/admin/reactivacionPerfiles]", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios desactivados." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/reactivacionPerfiles
 * Reactiva un perfil: estado = 1, fecha_desactivacion = null
 * Body: { id_usuario: string }
 */
export async function PATCH(request: Request) {
  try {
    const { id_usuario } = await request.json();

    if (!id_usuario) {
      return NextResponse.json(
        { error: "id_usuario es requerido." },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario },
      select: { email: true, nombres: true },
    });

    if (!usuario || !usuario.email) {
      return NextResponse.json(
        { success: false, message: "Usuario no encontrado o sin email" },
        { status: 404 }
      );
    }

    await prisma.usuario.update({
      where: { id_usuario },
      data: {
        estado: 1,
        fecha_desactivacion: null,
      },
    });

    try {
      await enviarReactivacionPorSoporte(
        usuario.email,
        usuario.nombres || "Usuario"
      );
      console.log(`[Admin Reactivación] ✅ Email enviado exitosamente a: ${usuario.email}`);
    } catch (emailError) {
      console.error(`[Admin Reactivación] ❌ Error enviando email a ${usuario.email}:`, emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH /api/admin/reactivacionPerfiles]", error);
    return NextResponse.json(
      { error: "Error al reactivar el perfil." },
      { status: 500 }
    );
  }
}