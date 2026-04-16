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
      console.log("[AUTH/ME] No hay token en cookies");
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    console.log("[AUTH/ME] Token encontrado, verificando...");

    const decoded = verify(authToken, process.env.JWT_SECRET!) as {
      userId: string;
    };

    console.log("[AUTH/ME] JWT válido para userId:", decoded.userId);

    const { data: userData, error } = await supabaseAdmin
      .from("Usuario")
      .select("id_usuario, nombres, email, rol")
      .eq("id_usuario", decoded.userId) 
      .maybeSingle();

    if (error || !userData) {
      console.error("[AUTH/ME] Usuario no encontrado en BD");
      return NextResponse.json(
        { error: "Usuario no encontrado en tokens" },
        { status: 404 }
      );
    }

    const user = {
      id: userData.id_usuario,
      name: userData.nombres,
      email: userData.email,
      rol: userData.rol,
    };

    console.log("[AUTH/ME] ✅ Usuario autenticado:", user.email);

    return NextResponse.json({ user }, { status: 200 });

  } catch (error) {
    console.error("[AUTH/ME] Error:", error);
    return NextResponse.json(
      { error: "No autenticado o token inválido" },
      { status: 401 }
    );
  }
}