import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validaciones básicas
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    // Autenticar con Supabase Auth
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

    // Obtener datos del usuario desde la tabla Usuario con Prisma
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

    const user = {
      id: userData.id_usuario,
      name: userData.nombres,
      email: userData.email,
    };

    const response = NextResponse.json(
      { user, message: "Sesión iniciada exitosamente" },
      { status: 200 }
    );

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
