import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";  // Para CREAR JWT

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    // ↳ Recibe email y password del LoginForm

    // ✅ 1. VALIDAR CAMPOS
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    // 🔐 2. AUTENTICAR CON SUPABASE AUTH
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
      // ↳ Supabase verifica email/password en su tabla auth.users
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: "Email o contraseña incorrectos" },
        { status: 401 }
      );
    }

    // 3. OBTENER DATOS DEL USUARIO DE LA TABLA "Usuario"
    const userData = await prisma.usuario.findUnique({
      where: { id_usuario: authData.user.id },  // ID de Supabase Auth
      select: { id_usuario: true, nombres: true, email: true, rol: true }
    });

    if (!userData) {
      return NextResponse.json(
        { error: "Error al obtener datos del usuario" },
        { status: 400 }
      );
    }

    // 🎫 4. CREAR JWT TOKEN
    const jwtToken = sign(
      { userId: userData.id_usuario },  // Datos dentro del token
      process.env.JWT_SECRET!,           // Clave secreta
      { expiresIn: "7d" }                // Expira en 7 días
    );
    // ↳ Ejemplo de JWT:
    // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhYmMxMjMifQ.xxxxx

    // 🍪 5. CREAR RESPUESTA + GUARDAR JWT EN COOKIE
    const response = NextResponse.json(
      { message: "Sesión iniciada exitosamente" },
      { status: 200 }
    );

    // IMPORTANTE: Configurar cookie httpOnly
    response.cookies.set("auth_token", jwtToken, {
      httpOnly: true,                           // ❌ No se puede acceder desde JavaScript
      secure: process.env.NODE_ENV === "production",  // 🔒 HTTPS en producción
      sameSite: "lax",                          // 🛡️ Protege contra CSRF
      maxAge: 7 * 24 * 60 * 60,                 // 7 días en segundos
      path: "/",                                // Disponible en toda la app
    });
    // ↳ El NAVEGADOR envía esta cookie automáticamente en cada request

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
