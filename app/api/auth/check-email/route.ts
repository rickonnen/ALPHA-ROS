import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    // Buscar en la tabla Usuario directamente
    const { data: existingUser, error } = await supabaseAdmin
      .from('Usuario')
      .select('id_usuario, email')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error("Error al buscar usuario:", error);
      return NextResponse.json({ error: "Error al verificar email" }, { status: 500 });
    }

    const emailExists = !!existingUser;

    console.log(`[CHECK-EMAIL] Email: ${email}, Existe: ${emailExists}`);

    return NextResponse.json({ exists: emailExists }, { status: 200 });
  } catch (error: any) {
    console.error("[CHECK-EMAIL] Error:", error);
    return NextResponse.json({ error: "Error al verificar email" }, { status: 500 });
  }
}
