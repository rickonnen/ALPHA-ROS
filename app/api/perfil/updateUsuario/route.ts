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
/*  Dev: Alvarado Alisson Dalet - sow-AlissonA
    Fecha: 04/04/2026
    Fix: Validacion de largo maximo: nombres max 15 caracteres,
         apellidos max 15 caracteres, direccion max 40 caracteres
         Agregar username a campos editables
*/
/*  Dev: Alvarado Alisson Dalet - sow-AlissonA
    Fecha: 09/04/2026
    Fix: Validacion de minimo 3 letras en username
         Restriccion de emojis en username
*/
/*
 * Modificado: Dylan Coca Beltran - 16/04/2026
 * Cambio: Adición de campos genero, fecha_nac y estado_civil al destructuring
 * y al prisma.update — campos presentes en el schema pero ausentes en la versión anterior,
 * validación de emojis extendida a nombre, apellido y dirección (antes solo aplicaba a username),
 * corrección de id_pais vacío usando || null en lugar de ?? null para capturar strings vacíos,
 * extracción de regexSoloLetras y regexSinAcentos fuera del handler para evitar
 * reinstanciación en cada request
 */
/** Dev: Alvarado Alisson Dalet - sow-AlissonA
 * Fecha: 22/04/2026
 * Fix: Validacion de username duplicado, verifica si otro usuario ya usa el mismo
 *      username antes de ejecutar el update
 */
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const intMaxName           = 50;
const intMaxLastName       = 50;
const intMaxAddress        = 200;
const intMaxUsername       = 20;
const intMinLetrasUsername = 3;
const regexSinEmojis       = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27FF}\u{FE00}-\u{FE0F}]/u;
const regexSoloLetras      = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
const regexSinAcentos      = /^[^\u00C0-\u024F]+$/;

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id_usuario,
      nombres,
      apellidos,
      direccion,
      url_foto_perfil,
      id_pais,
      username,
      genero,
      fecha_nac,
      estado_civil,
    } = body;

    // id_usuario
    if (!id_usuario) {
      return NextResponse.json(
        { error: "Falta el campo id_usuario" },
        { status: 400 }
      );
    }

    const strNombres   = nombres?.trim();
    const strApellidos = apellidos?.trim();
    const strDireccion = direccion?.trim() ?? "";
    const strUsername  = username?.trim();

    // Nombre
    if (!strNombres) {
      return NextResponse.json(
        { error: "El campo nombre no puede estar vacío." },
        { status: 400 }
      );
    }
    if (regexSinEmojis.test(strNombres)) {
      return NextResponse.json(
        { error: "El nombre no puede contener emojis." },
        { status: 400 }
      );
    }
    if (!regexSoloLetras.test(strNombres)) {
      return NextResponse.json(
        { error: "El nombre solo puede contener letras." },
        { status: 400 }
      );
    }
    if (strNombres.length < 3) {
      return NextResponse.json(
        { error: "El nombre debe tener al menos 3 caracteres." },
        { status: 400 }
      );
    }
    if (strNombres.length > intMaxName) {
      return NextResponse.json(
        { error: `El nombre no puede superar ${intMaxName} caracteres.` },
        { status: 400 }
      );
    }

    // Apellido
    if (!strApellidos) {
      return NextResponse.json(
        { error: "El campo apellido no puede estar vacío." },
        { status: 400 }
      );
    }
    if (regexSinEmojis.test(strApellidos)) {
      return NextResponse.json(
        { error: "El apellido no puede contener emojis." },
        { status: 400 }
      );
    }
    if (!regexSoloLetras.test(strApellidos)) {
      return NextResponse.json(
        { error: "El apellido solo puede contener letras." },
        { status: 400 }
      );
    }
    if (strApellidos.length < 3) {
      return NextResponse.json(
        { error: "El apellido debe tener al menos 3 caracteres." },
        { status: 400 }
      );
    }
    if (strApellidos.length > intMaxLastName) {
      return NextResponse.json(
        { error: `El apellido no puede superar ${intMaxLastName} caracteres.` },
        { status: 400 }
      );
    }

    // Dirección
    if (!strDireccion) {
      return NextResponse.json(
        { error: "El campo dirección no puede estar vacío." },
        { status: 400 }
      );
    }
    if (regexSinEmojis.test(strDireccion)) {
      return NextResponse.json(
        { error: "La dirección no puede contener emojis." },
        { status: 400 }
      );
    }
    if (strDireccion.length > intMaxAddress) {
      return NextResponse.json(
        { error: `La dirección no puede superar ${intMaxAddress} caracteres.` },
        { status: 400 }
      );
    }

    // Username
    if (!strUsername) {
      return NextResponse.json(
        { error: "El campo username no puede estar vacío." },
        { status: 400 }
      );
    }
    if (strUsername.length > intMaxUsername) {
      return NextResponse.json(
        { error: `El username no puede superar ${intMaxUsername} caracteres.` },
        { status: 400 }
      );
    }
    if (!regexSinAcentos.test(strUsername)) {
      return NextResponse.json(
        { error: "El username no puede contener letras con acento." },
        { status: 400 }
      );
    }
    if (regexSinEmojis.test(strUsername)) {
      return NextResponse.json(
        { error: "El username no puede contener emojis." },
        { status: 400 }
      );
    }
    const intCantLetras = (strUsername.match(/[a-zA-Z]/g) ?? []).length;
    if (intCantLetras < intMinLetrasUsername) {
      return NextResponse.json(
        { error: `El username debe contener al menos ${intMinLetrasUsername} letras.` },
        { status: 400 }
      );
    }

    // Verificar si el username ya está en uso por otro usuario
    const objUsuarioExistente = await prisma.usuario.findFirst({
      where: {
        username: strUsername,
        NOT: { id_usuario },
      },
    });
    if (objUsuarioExistente) {
      return NextResponse.json(
        { error: "El nombre de usuario ya está en uso. Por favor elige otro." },
        { status: 409 }
      );
    }

    // Prisma update
    const dtFechaNac = fecha_nac ? new Date(fecha_nac) : null;
    const objUsuarioActualizado = await prisma.usuario.update({
      where: { id_usuario },
      data: {
        nombres:          strNombres,
        apellidos:        strApellidos,
        direccion:        strDireccion,
        url_foto_perfil,
        id_pais:          id_pais || null,
        username:         strUsername,
        genero:           genero          ?? null,
        fecha_nac:        dtFechaNac,
        estado_civil:     estado_civil    ?? null,
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
