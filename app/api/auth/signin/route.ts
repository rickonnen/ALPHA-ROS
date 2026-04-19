import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    // Primero verificar si el usuario existe
    const userExists = await prisma.usuario.findFirst({
      where: { email: email },
      select: { id_usuario: true }
    });

    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.user) {
      // Si el usuario existe pero el login falló, es por contraseña incorrecta
      if (userExists) {
        return NextResponse.json(
          { 
            error: "Contraseña incorrecta",
            code: "INVALID_PASSWORD"
          },
          { status: 401 }
        );
      } else {
        // Usuario no encontrado
        return NextResponse.json(
          { 
            error: "El correo electrónico no está registrado",
            code: "USER_NOT_FOUND"
          },
          { status: 401 }
        );
      }
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
    

    const response = NextResponse.json(
      { message: "Sesión iniciada exitosamente" },
      { status: 200 }
    );

    response.cookies.set("auth_token", jwtToken, {
      httpOnly: true,                         
      secure: process.env.NODE_ENV === "production", 
      sameSite: "lax",                         
      maxAge: 7 * 24 * 60 * 60,               
      path: "/",                          
    });

    return response;

  } catch (error: any) {
    // Detectar errores de conexión a base de datos
    if (error.code === "P1011" || 
        error.message?.includes("Can't reach database") ||
        error.message?.includes("database server")) {
      return NextResponse.json(
        { error: "No tienes conexión a internet" },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: "Error en el servidor: " + String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
