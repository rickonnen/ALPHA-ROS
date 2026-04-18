
/**
 * Endpoint: /api/perfil/telefono/existe
 * Author: Miguel Angel Condori
 * Date: 2026-04-17
 * Description: Verifica si un número de teléfono ya está activo en la base
 * de datos por un usuario distinto al que realiza la consulta.
 *
 * Recibe en el body del POST:
 *  - numero: string (número completo con código de país, ej: "+59171234567")
 *  - id_usuario: string (ID del usuario consultante, para excluir sus propios números)
 *
 * Funcionalidad:
 *  - Valida el número con libphonenumber-js antes de consultar la base de datos.
 *  - Excluye los teléfonos activos del propio usuario si se recibe id_usuario.
 *  - Devuelve { existe: true } si el número pertenece a otro usuario activo.
 *  - Devuelve { existe: false } si el número es inválido, no existe o solo
 *    pertenece al propio usuario consultante.
 */


import { NextResponse } from "next/server";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { numero, id_usuario } = await req.json();  // ← agregar id_usuario
  if (!numero) return NextResponse.json({ existe: false });

  const phone = parsePhoneNumberFromString(numero);
  if (!phone || !phone.isValid()) return NextResponse.json({ existe: false });

  const telefono = await prisma.telefono.findFirst({
    where: {
      nro_telefono: phone.nationalNumber,
      codigo_pais: parseInt(phone.countryCallingCode, 10),
    },
    include: {
      UsuarioTelefono: {
        where: {
          estado: 1,
          ...(id_usuario ? { NOT: { id_usuario } } : {}),  // ← excluir al propio usuario
        }
      }
    }
  });

  const existe = Boolean(telefono?.UsuarioTelefono?.length);
  return NextResponse.json({ existe });
}