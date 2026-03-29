/*  Dev: David Chavez Totora - xdev/davidc
    Fecha: 27/03/2026
    Funcionalidad: GET /backend/perfil/get?id_usuario=...
      - Retorna los datos del usuario + sus teléfonos + su país
*/
/*  Dev: Alvarado Alisson Dalet - xdev/sow-AlissonA
    Fecha: 28/03/2026
    Funcionalidad: Agrega include de Pais para el campo pais en editar perfil
*/
/*  Dev: David Chavez Totora - xdev/davidc
    Fecha: 28/03/2026
    Funcionalidad: GET /backend/perfil/getUsuario?id_usuario=...
      - Se anadio el retorno del pais del usuario
*/
/*  Dev: David Chavez Totora - xdev/davidc
    Fecha: 29/03/2026
    Funcionalidad: FIX bd y cambios en Telefono
*/
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id_usuario = searchParams.get("id_usuario");

  if (!id_usuario) {
    return NextResponse.json(
      { error: "Falta el parámetro id_usuario" },
      { status: 400 }
    );
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario },
      include: {
        UsuarioTelefono: {
          where: { estado: 1 },
          include: { Telefono: true },
        },
        Rol: true,
        Pais: true,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: usuario }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}