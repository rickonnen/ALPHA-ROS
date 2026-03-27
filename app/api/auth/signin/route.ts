import { NextRequest, NextResponse } from "next/server";

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

    // Aquí iría la lógica de login con tu base de datos
    // Por ahora, simulamos un usuario exitoso
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      name: "Usuario de Prueba",
      email,
    };

    // Crear respuesta con cookie
    const response = NextResponse.json(
      { user, message: "Sesión iniciada exitosamente" },
      { status: 200 }
    );

    // Guardar token/sesión en cookie
    response.cookies.set("auth_token", JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return response;
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
