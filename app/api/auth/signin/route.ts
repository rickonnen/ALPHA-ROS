import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import { registrarSesionTelemetry } from "@/lib/auth/sessionTelemetry";
import { randomBytes } from 'crypto';

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

    // Primero verificar si el usuario existe
    const userExists = await prisma.usuario.findFirst({
      where: { email: email },
      select: { 
        id_usuario: true,
        // dos_fa_habilitado, dos_fa_secreto pueden no existir aún
      }
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
            error: "Contraseña incorrecta",
            code: "USER_NOT_FOUND"
          },
          { status: 401 }
        );
      }
    }

    // ✅ NUEVO: Verificar si 2FA está habilitado (usando any por compatibilidad)
    const userExtra = await (prisma.usuario.findUnique as any)({
      where: { id_usuario: authData.user.id },
      select: { 
        dos_fa_habilitado: true,
        dos_fa_secreto: true,
      }
    }).catch((e: any) => ({
      dos_fa_habilitado: false,
      dos_fa_secreto: null
    }));

    if (userExtra?.dos_fa_habilitado && userExtra?.dos_fa_secreto) {
      // Crear un token temporal para la verificación 2FA
      const tempToken = randomBytes(32).toString('hex');
      
      // Guardar el token temporal en sesión (aquí usamos una cookie temporal)
      const response = NextResponse.json(
        { 
          requiresOTP: true,
          message: "Se requiere verificación 2FA",
          userId: authData.user.id
        },
        { status: 200 }
      );

      // Cookie temporal para guardar el estado de auth incompleto (5 minutos)
      response.cookies.set("temp_auth_token", tempToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 5 * 60, // 5 minutos
        path: "/",
      });

      // Guardar que este usuario está en proceso de verificación 2FA
      response.cookies.set("pending_2fa_user", authData.user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 5 * 60,
        path: "/",
      });

      return response;
    }

    
    
    //  Si no tiene 2FA, proceder normalmente
    const userData = await prisma.usuario.findUnique({
  where: { id_usuario: authData.user.id }, 
  select: { id_usuario: true, nombres: true, email: true, rol: true, estado: true }
});

if (!userData) {
  return NextResponse.json(
    { error: "Error al obtener datos del usuario" },
    { status: 400 }
  );
}
await registrarSesionTelemetry({
      request,
      idUsuario: userData.id_usuario,
      latitud,
      longitud,
    });
// HU-04 CA-3: bloquear login si cuenta desactivada
if (userData.estado === 0) {
  return NextResponse.json(
    {
      error: "Tu cuenta está desactivada. Para recuperar el acceso, comunícate con nuestro equipo de soporte técnico.",
      code: "ACCOUNT_DISABLED",
    },
    { status: 403 }
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