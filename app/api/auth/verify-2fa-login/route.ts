import { NextRequest, NextResponse } from "next/server";
import speakeasy from "speakeasy";
import { prisma } from "@/lib/prisma";
import { sign } from "jsonwebtoken";

/**
 * ENDPOINT: Verificar código 2FA durante login
 * POST /api/auth/verify-2fa-login
 * Body: { userId: string, codigo: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, codigo } = await request.json();

    if (!userId || !codigo) {
      return NextResponse.json(
        { error: "Parámetros incompletos" },
        { status: 400 }
      );
    }

    // Validar formato: 6 dígitos
    if (!/^\d{6}$/.test(codigo)) {
      return NextResponse.json(
        { error: "Código debe ser 6 dígitos" },
        { status: 400 }
      );
    }

    // Obtener secreto 2FA del usuario
    const usuario = await (prisma.usuario.findUnique as any)({
      where: { id_usuario: userId },
      select: { 
        id_usuario: true,
        dos_fa_secreto: true,
        dos_fa_habilitado: true,
        nombres: true,
        email: true,
        rol: true
      }
    }).catch((e: any) => null);

    if (!usuario || !usuario.dos_fa_secreto || !usuario.dos_fa_habilitado) {
      return NextResponse.json(
        { error: "2FA no está configurado para este usuario" },
        { status: 400 }
      );
    }

    // Verificar código TOTP (buscar en ±3 minutos como en setup)
    const ahora = Math.floor(Date.now() / 1000);
    let esValido = false;

    for (let i = -6; i <= 6; i++) {
      const tiempoVentana = ahora + (i * 30);
      const codigoVentana = speakeasy.totp({
        secret: usuario.dos_fa_secreto,
        encoding: "base32",
        time: tiempoVentana,
      });

      if (codigoVentana === codigo) {
        esValido = true;
        break;
      }
    }

    if (!esValido) {
      console.log(`[2FA LOGIN] Código inválido para usuario: ${userId}`);
      return NextResponse.json(
        { error: "Código 2FA inválido o expirado" },
        { status: 401 }
      );
    }

    // ✓ Código válido - Crear JWT y completar login
    console.log(`[2FA LOGIN] ✓ Verificación 2FA exitosa para: ${usuario.email}`);

    const jwtToken = sign(
      { userId: usuario.id_usuario },  
      process.env.JWT_SECRET!,           
      { expiresIn: "7d" }          
    );

    const response = NextResponse.json(
      { 
        message: "Sesión iniciada exitosamente",
        success: true 
      },
      { status: 200 }
    );

    // Establecer JWT token
    response.cookies.set("auth_token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: "/",
    });

    // Limpiar cookies temporales
    response.cookies.set("temp_auth_token", "", {
      maxAge: 0,
      path: "/",
    });
    response.cookies.set("pending_2fa_user", "", {
      maxAge: 0,
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("[2FA LOGIN] Error verificando 2FA:", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
