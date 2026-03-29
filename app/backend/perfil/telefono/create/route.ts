/**
 * Endpoint: /backend/perfil/telefono/create
 * Author: Miguel Angel Condori
 * Date: 2026-03-28
 * Description: Permite registrar un nuevo número de teléfono para un usuario.
 * 
 * Funcionalidad:
 * Valida que el número recibido no esté vacío.
 * Inserta el nuevo teléfono en la base de datos asociado al usuario.
 * Devuelve un JSON con el teléfono creado y sus datos asociados.
 * Maneja errores y retorna un estado HTTP adecuado en caso de fallo.
 * 
 * Uso:
 * Desde la interfaz de TelefonosView se llama este endpoint al hacer
 * "Guardar cambios" sobre un teléfono nuevo.
 */

/**
 * Endpoint: /backend/perfil/telefono/create
 * Author: Miguel Angel Condori
 * Date: (2026-03-29):
 *  Se implementó la creación de teléfonos asociados a un usuario.
 *  Se valida el número utilizando libphonenumber-js.
 *  Se normaliza el número en código de país y número nacional.
 *  Se crea el teléfono en la tabla Telefono si no existe.
 *  Se crea la relación en UsuarioTelefono con estado activo.
 *  Se controlan errores de validación y base de datos.
 */

import { NextResponse } from "next/server";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { numero, id_usuario } = await req.json();

    if (!numero || !id_usuario) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const phone = parsePhoneNumberFromString(numero);

    if (!phone || !phone.isValid()) {
      return NextResponse.json(
        { error: "Número inválido" },
        { status: 400 }
      );
    }

    const codigo_pais = parseInt(phone.countryCallingCode, 10);
    const nro_telefono = phone.nationalNumber;

    const resultado = await prisma.$transaction(async (tx) => {

      const cantidadActivos = await tx.usuarioTelefono.count({
        where: {
          id_usuario,
          estado: 1,
        },
      });

      if (cantidadActivos >= 3) {
        throw new Error("MAX_TELEFONOS");
      }

      let telefono = await tx.telefono.findFirst({
        where: {
          nro_telefono,
          codigo_pais,
        },
      });

      if (!telefono) {
        telefono = await tx.telefono.create({
          data: {
            nro_telefono,
            codigo_pais,
          },
        });
      }

      const existeActivo = await tx.usuarioTelefono.findFirst({
        where: {
          id_usuario,
          id_telefono: telefono.id_telefono,
          estado: 1,
        },
      });

      if (existeActivo) {
        throw new Error("TELEFONO_YA_ACTIVO");
      }

      const usuarioTelefonoNuevo = await tx.usuarioTelefono.create({
        data: {
          id_usuario,
          id_telefono: telefono.id_telefono,
          estado: 1,
        },
      });

      return {
        telefono,
        usuarioTelefonoNuevo,
      };
    });

    return NextResponse.json(
      {
        ok: true,
        data: resultado,
      },
      { status: 201 }
    );

  } catch (error) {

    if (error instanceof Error && error.message === "TELEFONO_YA_ACTIVO") {
      return NextResponse.json(
        { error: "El usuario ya tiene este teléfono activo" },
        { status: 409 }
      );
    }

    if (error instanceof Error && error.message === "MAX_TELEFONOS") {
      return NextResponse.json(
        { error: "El usuario ya tiene el máximo de teléfonos (3)" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}