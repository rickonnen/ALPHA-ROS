/* Dev: HU-04
   Funcionalidad: PATCH /api/perfil/desactivarCuenta
   - CA-2:  estado pasa a 0 (cuenta desactivada)
   - CA-11: registra fecha_desactivacion en la BD
   - CA-5:  borra HistorialVistos del usuario (datos públicos dejan de ser visibles)
   - CA-17: elimina cookie auth_token del navegador actual
   - CA-8:  si falla, cuenta permanece activa
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
 
    // CA-2 + CA-11: desactivar cuenta y registrar fecha en una sola transacción
    // CA-5: borrar historial de vistos del usuario (datos ya no visibles para otros)
    await prisma.$transaction([
      prisma.usuario.update({
        where: { id_usuario },
        data: {
          estado: 0,
          fecha_desactivacion: new Date(),
        },
      }),
      prisma.historialVistos.deleteMany({
        where: { id_usuario },
      }),
    ]);
 
    // CA-17: eliminar cookie del navegador actual
    const response = NextResponse.json(
      { message: "Cuenta desactivada correctamente" },
      { status: 200 }
    );
 
    response.cookies.delete("auth_token");
 
    return response;
 
  } catch (error) {
    console.error("Error al desactivar cuenta:", error);
    // CA-8: error del sistema → cuenta permanece activa
    return NextResponse.json(
      { error: "Error interno del servidor. La cuenta permanece activa." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
 