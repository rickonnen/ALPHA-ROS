/* Dev: [Tu nombre] - HU-04
   Fecha: [fecha]
   Funcionalidad: PATCH /api/perfil/desactivarCuenta
   - Marca estado = 0 en la tabla Usuario (CA-2)
   - Elimina cookie auth_token del navegador actual (CA-17)
*/
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_usuario } = body;

    if (!id_usuario) {
      return NextResponse.json(
        { error: "Falta el campo id_usuario" },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe y está activo
    const usuarioActual = await prisma.usuario.findUnique({
      where: { id_usuario },
      select: { estado: true },
    });

    if (!usuarioActual) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    if (usuarioActual.estado === 0) {
      return NextResponse.json(
        { error: "La cuenta ya está desactivada" },
        { status: 409 }
      );
    }

    // CA-2: estado pasa a 0
    await prisma.usuario.update({
      where: { id_usuario },
      data: { estado: 0 },
    });

    // CA-17: eliminar cookie del navegador actual
    const response = NextResponse.json(
      { message: "Cuenta desactivada correctamente" },
      { status: 200 }
    );

    response.cookies.delete("auth_token");

    return response;

  } catch (error) {
    console.error("Error al desactivar cuenta:", error);
    // CA-8: error del sistema, cuenta permanece activa
    return NextResponse.json(
      { error: "Error interno del servidor. La cuenta permanece activa." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}