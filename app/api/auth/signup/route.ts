import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validaciones básicas
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Aquí iría la lógica de registro con tu base de datos
    // Por ahora, simulamos un usuario exitoso
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
    };

    // Crear respuesta con cookie
    const response = NextResponse.json(
      { user, message: "Usuario registrado exitosamente" },
      { status: 201 }
    );

    // Guardar token/sesión en cookie (puedes usar JWT)
    response.cookies.set("auth_token", JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
