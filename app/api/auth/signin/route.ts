import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session_id")?.value ?? crypto.randomUUID();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: "Email o contraseña incorrectos" },
        { status: 401 }
      );
    }

    const userData = await prisma.usuario.findUnique({
      where: { id_usuario: authData.user.id }, 
      select: { id_usuario: true, nombres: true, email: true, rol: true }
    });

    if (!userData) {
      return NextResponse.json(
        { error: "Error al obtener datos del usuario" },
        { status: 400 }
      );
    }

    const jwtToken = sign(
      { userId: userData.id_usuario },  
      process.env.JWT_SECRET!,           
      { expiresIn: "7d" }          
    );
    // ↳ Ejemplo de JWT:
    // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhYmMxMjMifQ.xxxxx

    const response = NextResponse.json(
      { message: "Sesión iniciada exitosamente" },
      { status: 200 }
    );

    const { error: migrateError } = await supabaseAdmin.rpc("migrar_eventos_sesion", {
      p_session_id: sessionId,
      p_id_usuario: userData.id_usuario,
    });
    if (migrateError) {
      console.error("Error migrando eventos de sesión:", migrateError);
    }

    response.cookies.set("auth_token", jwtToken, {
      httpOnly: true,                         
      secure: process.env.NODE_ENV === "production", 
      sameSite: "lax",                         
      maxAge: 7 * 24 * 60 * 60,               
      path: "/",                          
    });

    response.cookies.set("session_id", sessionId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });

    return response;

  } catch (error) {
    return NextResponse.json(
      { error: "Error en el servidor: " + String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}