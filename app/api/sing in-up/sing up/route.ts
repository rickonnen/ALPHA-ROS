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

    // se reciben 'nombre' y 'apellido' separados
    const { email, password, nombre, apellido } = await request.json();
    console.log("Datos recibidos:", { email, password: "***", nombre, apellido });

    // 1. Crear el usuario en Supabase Auth
    console.log("Creando usuario en Auth...");
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nombre, apellido } 
    });

    if (authError) {
      console.error("Error en Auth:", authError);
      return NextResponse.json({ error: "Error en Auth: " + authError.message }, { status: 400 });
    }

    console.log("Usuario creado en Auth con ID:", authData.user.id);

    console.log("Verificando si usuario existe...");
    
    const { data: existingUser } = await supabaseAdmin
      .from('Usuario')
      .select('id_usuario')
      .eq('id_usuario', authData.user.id)
      .single();

    if (!existingUser) {
      console.log("Insertando en tabla Usuario...");
      const { data: dbData, error: dbError } = await supabaseAdmin
        .from('Usuario')
        .insert([
          {
            id_usuario: authData.user.id,
            email: email,
            nombres: nombre,
            apellidos: apellido,
            rol: 2,
            estado: 1
          }
        ]);

      if (dbError) {
        console.error("Error en DB:", dbError);
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        return NextResponse.json({ error: "Error de Tabla: " + dbError.message }, { status: 400 });
      }
    }

    console.log("Usuario insertado en tabla Usuario");
    return NextResponse.json({ message: "¡Registro exitoso!" }, { status: 200 });

  } catch (err) {
    console.error("Error en el servidor:", err);
    return NextResponse.json({ error: "Error crítico de servidor: " + String(err) }, { status: 500 });
  }
}