import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sign } from "jsonwebtoken";
import { verifyCode } from "@/lib/verificationCodes";
import { enviarBienvenida } from "@/lib/email/emailService";
import { crearNotificacion } from "@/lib/notifications/notificationService";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { nombre, apellido, email, password, verificationCode } = await request.json();

    if (!email || !verificationCode) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();

    // Validar código desde Supabase
    const validation = await verifyCode(normalizedEmail, verificationCode);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error || "Código inválido" }, { status: 400 });
    }

    // Registrar en Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: { nombre, apellido },
    });

    if (authError) {
      const errorMsg = authError.message?.toLowerCase() || "";
      let errorMessage = authError.message || "Error al registrarse";

      if (
        errorMsg.includes("already registered") ||
        errorMsg.includes("already exists") ||
        errorMsg.includes("duplicate") ||
        errorMsg.includes("user already exists")
      ) {
        errorMessage = "El correo electrónico ya está registrado. Por favor, inicia sesión o intenta con uno distinto.";
      }

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Insertar en tabla Usuario
    const { error: dbError } = await supabaseAdmin
      .from("Usuario")
      .upsert(
        [{
          id_usuario: authData.user.id,
          email: normalizedEmail,
          nombres: nombre,
          apellidos: apellido,
          rol: 2,
          estado: 1,
        }],
        { onConflict: "id_usuario" }
      );

    if (dbError) {
      console.error("Error en BD:", dbError);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: "Error al guardar usuario" }, { status: 400 });
    }

    // Generar JWT
    const jwtToken = sign({ userId: authData.user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });

    const response = NextResponse.json({
      message: "¡Registro exitoso!",
      userId: authData.user.id,
      email: normalizedEmail
    }, { status: 201 });

    response.cookies.set("auth_token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    await enviarBienvenida(normalizedEmail, nombre);
      try {
      await crearNotificacion({
      id_usuario: authData.user.id,
      titulo: "Bienvenido a PROBOL",
      mensaje: `¡Hola ${nombre}! Tu cuenta ha sido creada exitosamente. Bienvenido a la plataforma.`,
      id_categoria: 1,
    });
} catch (notifError) {
}
    return response;
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message || "Error al verificar" }, { status: 500 });
  }
}
