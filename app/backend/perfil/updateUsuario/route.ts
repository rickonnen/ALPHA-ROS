/*  Dev:
    Fecha:
    Funcionalidad: PUT /backend/perfil/update
      - Actualiza nombres, apellidos, direccion, username, url_foto_perfil
      - Body (JSON): { id_usuario, nombres, apellidos, direccion, username, url_foto_perfil }
*/
/*  Dev: Alvarado Alisson Dalet - xdev/sow-AlissonA
    Fecha: 27/03/2026
    Funcionalidad: PUT /backend/perfil/update
      Correcciones para llegar a los criterios de aceptacion
 * @param {String} id_usuario - ID del usuario a actualizar
 * @param {String} nombres - Nuevo nombre del usuario (requerido, no vacío)
 * @param {String} apellidos - Nuevo apellido del usuario (requerido, no vacío)
 * @param {String} direccion - Nueva dirección del usuario
 * @param {String} url_foto_perfil - URL de la nueva foto de perfil
 * @return {Object} - Datos actualizados del usuario en la base de datos
 */
/*  Dev: Alvarado Alisson Dalet - xdev/sow-AlissonA
    Fecha: 28/03/2026
    Correcciones para llegar a los criterios de aceptacion
*/
/*  Dev: Alvarado Alisson Dalet - xdev/sow-AlissonA
    Fecha: 28/03/2026
    Funcionalidad: Agrega id_pais al update
*/
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_usuario, nombres, apellidos, direccion, url_foto_perfil, id_pais } = body; // agrega id_pais
    if (!id_usuario) {
      return NextResponse.json(
        { error: "Falta el campo id_usuario" },
        { status: 400 }
      );
    }
    const strNombres = nombres?.trim();
    const strApellidos = apellidos?.trim();
    if (!strNombres || strNombres === "") {
      return NextResponse.json(
        { error: "El campo nombre no puede estar vacío" },
        { status: 400 }
      );
    }
    if (!strApellidos || strApellidos === "") {
      return NextResponse.json(
        { error: "El campo apellido no puede estar vacío" },
        { status: 400 }
      );
    }
    const regexSoloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    if (!regexSoloLetras.test(strNombres)) {
      return NextResponse.json(
        { error: "El nombre solo puede contener letras." },
        { status: 400 }
      );
    }
    if (!regexSoloLetras.test(strApellidos)) {
      return NextResponse.json(
        { error: "El apellido solo puede contener letras." },
        { status: 400 }
      );
    }
    if (strNombres.length < 3) {
      return NextResponse.json(
        { error: "El nombre debe tener al menos 3 caracteres." },
        { status: 400 }
      );
    }
    if (strApellidos.length < 3) {
      return NextResponse.json(
        { error: "El apellido debe tener al menos 3 caracteres." },
        { status: 400 }
      );
    }
    const objUsuarioActualizado = await prisma.usuario.update({
      where: { id_usuario },
      data: {
        nombres: strNombres,
        apellidos: strApellidos,
        direccion,
        url_foto_perfil,
        id_pais: id_pais ?? null, // agrega id_pais
      },
    });

    return NextResponse.json(
      { message: "Perfil actualizado correctamente", data: objUsuarioActualizado },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}