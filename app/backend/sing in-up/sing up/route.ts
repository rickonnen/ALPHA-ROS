import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    console.log("Iniciando signup, SUPABASE_URL:", process.env.SUPABASE_URL);
    console.log("SERVICE_ROLE_KEY exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    // se recibe el 'name' que contendrá el nombre completo
    const { email, password, name } = await request.json();
    console.log("Datos recibidos:", { email, password: "***", name });

    // 1. Crear el usuario en Supabase Auth
    console.log("Creando usuario en Auth...");
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name } 
    });

    if (authError) {
      console.error("Error en Auth:", authError);
      return NextResponse.json({ error: "Error en Auth: " + authError.message }, { status: 400 });
    }

    console.log("Usuario creado en Auth con ID:", authData.user.id);

    // 2. Insertar en tu tabla pública 'Usuario'
    console.log("Insertando en tabla Usuario...");
    console.log("Objeto a insertar:", {
      id_usuario: authData.user.id,
      email: email,
      nombres: name,
      rol: 2,
      estado: 1
    });
    
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

    console.log("Respuesta del insert:", { data: dbData, error: dbError });

    if (dbError) {
      console.error("Error en DB:", dbError);

      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: "Error de Tabla: " + dbError.message }, { status: 400 });
    }

    console.log("Usuario insertado en tabla Usuario");
    return NextResponse.json({ message: "¡Registro exitoso!" }, { status: 200 });

  } catch (err) {
    console.error("Error en el servidor:", err);
    return NextResponse.json({ error: "Error crítico de servidor: " + String(err) }, { status: 500 });
  }
}