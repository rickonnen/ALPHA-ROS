// app/api/auth/signup/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  'https://prjzzqorracgcjrvxdjj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByanp6cW9ycmFjZ2NqcnZ4ZGpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ0ODE3NSwiZXhwIjoyMDg5MDI0MTc1fQ.NY9gPySuIhsG6QvObuP2AxblzqG70eHW7lEWNC_loP4' 
);

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // 1. Crear en Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    });

    if (authError) {
      return NextResponse.json({ error: "Error en Auth: " + authError.message }, { status: 400 });
    }

    // 2. Insertar en tabla (Estructura mínima de 5 columnas)
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: email,
          name: name,
          password: password,
          role_id: 2 // Asegúrate que en tu tabla 'roles' el ID 1 exista
        }
      ]);

    if (dbError) {
      // Si falla la tabla, eliminamos el usuario de Auth para poder reintentar
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      console.error("DETALLE DEL ERROR:", dbError);
      return NextResponse.json({ error: "Error de Tabla: " + dbError.message }, { status: 400 });
    }

    return NextResponse.json({ message: "¡Éxito total!" }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: "Error crítico de servidor" }, { status: 500 });
  }
}