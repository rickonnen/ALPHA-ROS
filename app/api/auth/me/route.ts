import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";  // Para validar JWT
import { createClient } from "@supabase/supabase-js"; 

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get("auth_token")?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const decoded = verify(authToken, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const { data: userData, error } = await supabaseAdmin
      .from("Usuario")
      .select("id_usuario, nombres, email, rol")
      .eq("id_usuario", decoded.userId) 
      .maybeSingle();

    if (error || !userData) {
      return NextResponse.json(
        { error: "Usuario no encontrado en tokens" },
        { status: 404 }
      );
    }

    const user = {
      id: userData.id_usuario,
      name: userData.nombres,
      email: userData.email,
    };

    return NextResponse.json({ user }, { status: 200 });
    
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "No autenticado o token inválido" },
      { status: 401 }
    );
  }
}
