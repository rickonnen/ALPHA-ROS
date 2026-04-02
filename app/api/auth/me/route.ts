import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";  // Para validar JWT
import { createClient } from "@supabase/supabase-js";  // Para conectar a BD

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // 🔑 1. OBTENER JWT DE LA COOKIE
    const authToken = request.cookies.get("auth_token")?.value;
    // ↳ El navegador ENVÍA AUTOMÁTICO la cookie httpOnly
    
    if (!authToken) {
      // Si NO hay cookie = usuario no autenticado
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // ✅ 2. VALIDAR Y DESCODIFICAR JWT
    const decoded = verify(authToken, process.env.JWT_SECRET!) as {
      userId: string;
    };
    // ↳ Si el JWT es inválido o expiró, lanza error

    // 🔍 3. OBTENER DATOS DEL USUARIO DE SUPABASE
    const { data: userData, error } = await supabaseAdmin
      .from("Usuario")
      .select("id_usuario, nombres, email, rol")
      .eq("id_usuario", decoded.userId)  // Buscar por ID del token
      .maybeSingle();

    if (error || !userData) {
      return NextResponse.json(
        { error: "Usuario no encontrado en tokens" },
        { status: 404 }
      );
    }

    // 📦 4. RETORNAR USUARIO AL FRONTEND
    const user = {
      id: userData.id_usuario,
      name: userData.nombres,
      email: userData.email,
    };

    return NextResponse.json({ user }, { status: 200 });
    
  } catch (error) {
    // JWT expiró o es inválido
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "No autenticado o token inválido" },
      { status: 401 }
    );
  }
}
