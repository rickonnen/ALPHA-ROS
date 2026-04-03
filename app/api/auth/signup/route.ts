import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { nombre, apellido, email, password } = await request.json();

    if (!nombre || !apellido || !email || !password) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,        
      user_metadata: { nombre, apellido }       
    });

    if (authError) {
      return NextResponse.json({ error: "Error en Auth: " + authError.message }, { status: 400 });
    }

    // 3. INSERTAR EN TABLA "Usuario"
    const { error: dbError } = await supabaseAdmin
      .from('Usuario')
      .upsert([
        {
          id_usuario: authData.user.id,
          email: email,
          nombres: nombre,
          apellidos: apellido,
          rol: 2,
          estado: 1
        }
      ], { onConflict: 'id_usuario' });

    if (dbError) {
      console.error("Error al guardar en DB:", dbError);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: "Error de Tabla: " + dbError.message }, { status: 400 });
    }

    const jwtToken = sign(
      { userId: authData.user.id },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json(
      { message: "¡Registro exitoso!" },
      { status: 201 }  // 201 = Created
    );

    response.cookies.set("auth_token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;

  } catch (error) {
    return NextResponse.json(
      { error: "Error en el servidor: " + String(error) },
      { status: 500 }
    );
  }
}

