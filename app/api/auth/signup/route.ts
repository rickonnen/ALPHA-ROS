import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import { enviarBienvenida } from "@/lib/email/emailService";
import { crearNotificacion } from "@/lib/notifications/notificationService";
import { prisma } from "@/lib/prisma";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session_id")?.value ?? crypto.randomUUID();
    const { nombre, apellido, email, password } = await request.json();

    if (!nombre || !apellido || !email || !password) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Normalizar email a minúsculas
    const normalizedEmail = email.toLowerCase();

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,        
      user_metadata: { nombre, apellido }       
    });

    if (authError) {
      // Mapear errores de Supabase a mensajes en español
      const errorMsg = authError.message?.toLowerCase() || "";
      let errorMessage = authError.message || "Error al registrarse";
      
      if (errorMsg.includes("already registered") || 
          errorMsg.includes("already exists") || 
          errorMsg.includes("already been registered") ||
          errorMsg.includes("duplicate") ||
          errorMsg.includes("user already exists")) {
        errorMessage = "El correo electrónico ingresado ya se encuentra registrado. Por favor, inicia sesión o intenta con uno distinto.";
      }
      
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // 3. INSERTAR EN TABLA "Usuario"
    const { error: dbError } = await supabaseAdmin
      .from('Usuario')
      .upsert([
        {
          id_usuario: authData.user.id,
          email: normalizedEmail,
          nombres: nombre,
          apellidos: apellido,
          rol: 2,
          estado: 1,
          primary_provider: "credentials"
        }
      ], { onConflict: 'id_usuario' });

    if (dbError) {
      console.error("Error al guardar en DB:", dbError);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: "Error de Tabla: " + dbError.message }, { status: 400 });
    }

     console.log(`[SIGNUP] ✅ Usuario creado: ${authData.user.id} - ${normalizedEmail}`);

    const jwtToken = sign(
      { userId: authData.user.id },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json(
      { message: "¡Registro exitoso!" },
      { status: 201 }  // 201 = Created
    );

    const { error: migrateError } = await supabaseAdmin.rpc("migrar_eventos_sesion", {
      p_session_id: sessionId,
      p_id_usuario: authData.user.id,
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
try {
      await Promise.all([
        enviarBienvenida(normalizedEmail, nombre),
        crearNotificacion({
          id_usuario: authData.user.id,
          titulo: "Bienvenido a PROBOL",
          mensaje: `¡Hola ${nombre}! Tu cuenta ha sido creada exitosamente. Bienvenido a la plataforma.`,
          id_categoria: 1,
        })
      ]);
      console.log(`[SIGNUP] Email y notificación enviados para ${normalizedEmail}`);
    } catch (notifError) {
      // No es crítico si falla, el registro ya fue exitoso
      console.error("[SIGNUP] Error enviando email/notificación:", notifError);
    }
  
    return response;
  } catch (error: any) {
    
    console.error("[SIGNUP] Error general:", error);
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
  }
}
