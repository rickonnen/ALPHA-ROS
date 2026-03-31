/**
 * Dev: Dylan Coca Beltran
 * Fecha: 29/03/2026
 * Funcionalidad: Endpoint para actualizar la contraseña del usuario
 * @param id_usuario - ID del usuario en Supabase
 * @param strNewPassword - Nueva contraseña a guardar
 * @return 200 éxito, 400 error de validación, 500 error interno
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_usuario, strNewPassword } = body ?? {};

    // Verificar que llegaron los campos necesarios
    if (!id_usuario || !strNewPassword) {
      return NextResponse.json(
        {
          ok: false,
          reason: "MISSING_FIELDS",
          error: "Faltan campos obligatorios",
        },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Verificar que existen las variables de entorno
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        {
          ok: false,
          reason: "MISSING_SUPABASE_ENV",
          error: "Error interno del servidor",
        },
        { status: 500 }
      );
    }

    // Usar service role key para poder actualizar cualquier usuario
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase.auth.admin.updateUserById(
      id_usuario,
      { password: strNewPassword }
    );

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          reason: "UPDATE_FAILED",
          error: "No se pudo actualizar la contraseña",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: true, message: "Contraseña actualizada correctamente" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error al actualizar contraseña:", error);
    return NextResponse.json(
      {
        ok: false,
        reason: "INTERNAL_ERROR",
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}