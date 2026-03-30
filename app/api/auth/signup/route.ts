import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validaciones básicas
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    });

    if (authError) {
      return NextResponse.json({ error: "Error en Auth: " + authError.message }, { status: 400 });
    }

    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('Usuario')
      .insert([
        {
          id_usuario: authData.user.id,
          email: email,
          nombres: name,
          rol: 2,
          estado: 1
        }
      ]);

    if (dbError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: "Error de Tabla: " + dbError.message }, { status: 400 });
    }

    const response = NextResponse.json(
      { user: { id: authData.user.id, name, email }, message: "¡Registro exitoso!" },
      { status: 200 }
    );

    return response;

  } catch (error) {
    return NextResponse.json(
      { error: "Error en el servidor: " + String(error) },
      { status: 500 }
    );
  }
}
