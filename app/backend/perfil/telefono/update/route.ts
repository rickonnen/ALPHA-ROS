/**
 * Endpoint: /backend/perfil/telefono/update
 * Author: Miguel Angel Condori
 * Date: 2026-03-28
 * Description: Actualiza un número de teléfono existente de un usuario.
 * Recibe en el body del POST:
 *  - id_usuario: string (ID del usuario)
 *  - numero_viejo: string (teléfono a reemplazar)
 *  - numero_nuevo: string (nuevo teléfono)
 * 
 * Funcionalidad:
 *  - Valida que el número nuevo sea válido con libphonenumber-js.
 *  - Busca el número viejo asociado al usuario en la base de datos.
 *  - Reemplaza el número viejo por el número nuevo.
 *  - Devuelve un JSON con los datos del teléfono actualizado.
 *  - Maneja errores de validación o de actualización en la base de datos.
 */

/**
 * Author: Miguel Angel Condori
 * Date: (2026-03-29):
 *  Se mejoró la actualización de teléfonos existentes.
 *  Se añadió validación del número nuevo con libphonenumber-js.
 *  Se desactiva correctamente la relación del teléfono anterior.
 *  Se evita duplicar teléfonos activos para el mismo usuario.
 *  Se optimizó la lógica para reutilizar teléfonos existentes en base de datos.
 */


import { NextResponse } from "next/server";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { id_usuario, numero_viejo, numero_nuevo } = await req.json();
    if (!id_usuario || !numero_viejo || !numero_nuevo) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const phoneNuevo = parsePhoneNumberFromString(numero_nuevo);
    if (!phoneNuevo || !phoneNuevo.isValid()) {
      return NextResponse.json(
        { error: "Número nuevo inválido" },
        { status: 400 }
      );
    }

    const cod_pais_nuevo = parseInt(phoneNuevo.countryCallingCode, 10);
    const nro_telefono_nuevo = phoneNuevo.nationalNumber;

    const phoneViejo = parsePhoneNumberFromString(numero_viejo)!;
    const cod_pais_viejo = parseInt(phoneViejo.countryCallingCode, 10);
    const nro_telefono_viejo = phoneViejo.nationalNumber;

    const resultado = await prisma.$transaction(async (tx) => {

      let telefonoNuevo = await tx.telefono.findFirst({
        where: {
          nro_telefono: nro_telefono_nuevo,
          codigo_pais: cod_pais_nuevo,
        },
      });

      if (!telefonoNuevo) {
        telefonoNuevo = await tx.telefono.create({
          data: {
            nro_telefono: nro_telefono_nuevo,
            codigo_pais: cod_pais_nuevo,
          },
        });
      }

      const duplicado = await tx.usuarioTelefono.findFirst({
        where: {
          id_usuario,
          id_telefono: telefonoNuevo.id_telefono,
          estado: 1,
        },
      });

      if (duplicado) {
        throw new Error("TELEFONO_YA_ACTIVO");
      }


      const telefonoViejo = await tx.telefono.findFirst({
        where: {
          nro_telefono: nro_telefono_viejo,
          codigo_pais: cod_pais_viejo,
        },
      });

      if (!telefonoViejo) {
        throw new Error("TELEFONO_VIEJO_NO_ENCONTRADO");
      }

      // 4. Desactivar teléfono viejo
      await tx.usuarioTelefono.updateMany({
        where: {
          id_usuario,
          id_telefono: telefonoViejo.id_telefono,
          estado: 1,
        },
        data: {
          estado: 0,
        },
      });

      const usuarioTelefonoNuevo = await tx.usuarioTelefono.create({
        data: {
          id_usuario,
          id_telefono: telefonoNuevo.id_telefono,
          estado: 1,
        },
      });

      return {
        telefono: telefonoNuevo,
        usuarioTelefono: usuarioTelefonoNuevo,
      };
    });

    return NextResponse.json(
      { ok: true, data: resultado },
      { status: 200 }
    );

  } catch (error) {

    if (error instanceof Error) {
      if (error.message === "TELEFONO_YA_ACTIVO") {
        return NextResponse.json(
          { error: "El usuario ya tiene este teléfono activo" },
          { status: 409 }
        );
      }

      if (error.message === "TELEFONO_VIEJO_NO_ENCONTRADO") {
        return NextResponse.json(
          { error: "El teléfono anterior no fue encontrado" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}