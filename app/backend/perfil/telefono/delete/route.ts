/**
 * Endpoint: /backend/perfil/telefono/delete
 * Author: Miguel Angel Condori
 * Date: 2026-03-28
 * Description: Elimina (desactiva) un teléfono de un usuario.
 * Recibe en el body del POST:
 *  - id_usuario: string (ID del usuario)
 *  - numero: string (teléfono a eliminar)
 * 
 * Funcionalidad:
 *  - Valida que el número sea válido con libphonenumber-js.
 *  - Busca el teléfono en la tabla Telefono.
 *  - Busca la relación activa con el usuario en UsuarioTelefono.
 *  - Cambia el estado activo a 0 si existe.
 *  - Devuelve un JSON con mensaje de éxito o error.
 */

/**
 * Author: Miguel Angel Condori
 * Date: (2026-03-29):
 *  Se mejoró la eliminación lógica (soft delete) de teléfonos.
 *  Se añadió validación del número con libphonenumber-js.
 *  Se asegura que el teléfono exista antes de procesar la eliminación.
 *  Se valida que la relación con el usuario esté activa.
 *  Se actualiza el estado a inactivo en lugar de eliminar físicamente.
 */

import { NextResponse } from "next/server";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { id_usuario, numero } = await req.json();

    if (!id_usuario || !numero) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const numeroLimpio = numero.trim();

    const phone = parsePhoneNumberFromString(numeroLimpio);
    if (!phone || !phone.isValid()) {
      return NextResponse.json(
        { error: "Número inválido" },
        { status: 400 }
      );
    }

    const codigo_pais = parseInt(phone.countryCallingCode, 10);
    const nro_telefono = phone.nationalNumber;

    const resultado = await prisma.$transaction(async (tx) => {
      const telefono = await tx.telefono.findFirst({
        where: {
          nro_telefono,
          codigo_pais,
        },
      });

      if (!telefono) {
        throw new Error("TELEFONO_NO_ENCONTRADO");
      }

      const usuarioTelefono = await tx.usuarioTelefono.findFirst({
        where: {
          id_usuario,
          id_telefono: telefono.id_telefono,
          estado: 1,
        },
      });

      if (!usuarioTelefono) {
        throw new Error("USUARIO_TELEFONO_NO_ACTIVO");
      }

      const actualizado = await tx.usuarioTelefono.updateMany({
        where: {
          id_usuario,
          id_telefono: telefono.id_telefono,
          estado: 1,
        },
        data: {
          estado: 0,
        },
      });

      if (actualizado.count === 0) {
        throw new Error("NO_SE_PUDO_DESACTIVAR");
      }

      return {
        message: "Teléfono eliminado correctamente",
      };
    });

    return NextResponse.json(
      { ok: true, data: resultado },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "TELEFONO_NO_ENCONTRADO") {
        return NextResponse.json(
          { error: "El teléfono no fue encontrado" },
          { status: 404 }
        );
      }

      if (error.message === "USUARIO_TELEFONO_NO_ACTIVO") {
        return NextResponse.json(
          { error: "El usuario no tiene este teléfono activo" },
          { status: 404 }
        );
      }

      if (error.message === "NO_SE_PUDO_DESACTIVAR") {
        return NextResponse.json(
          { error: "No se pudo desactivar el teléfono" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}