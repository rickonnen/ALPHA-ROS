import { NextRequest, NextResponse } from "next/server";
import speakeasy from "speakeasy";
import { prisma } from "@/lib/prisma";
import { sign } from "jsonwebtoken";

// Mapa en memoria para rastrear intentos fallidos 
const intentosFallidos = new Map<string, { intentos: number; bloqueadoHasta: number }>();
 
const MAX_INTENTOS = 5;
const TIEMPO_BLOQUEO_SEGUNDOS = 60; 

/**
 * ENDPOINT: Verificar código 2FA durante login
 * POST /api/auth/verify-2fa-login
 * Body: { userId: string, codigo: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, codigo } = await request.json();

    // Validación estricta de parámetros
    if (!userId || typeof userId !== "string" || userId.trim() === "") {
      console.error("[2FA LOGIN] userId inválido o vacío:", userId);
      return NextResponse.json(
        { error: "ID de usuario inválido" },
        { status: 400 }
      );
    }

    if (!codigo || typeof codigo !== "string") {
      console.error("[2FA LOGIN] codigo inválido");
      return NextResponse.json(
        { error: "Código inválido" },
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

    console.log(`[2FA LOGIN] Verificando 2FA para usuario: ${userId}, código: ${codigo.substring(0, 3)}...`);

    // Verificar si el usuario está bloqueado por intentos fallidos
    const ahora = Math.floor(Date.now() / 1000);
    const registro = intentosFallidos.get(userId);
 
    if (registro?.bloqueadoHasta && ahora < registro.bloqueadoHasta) {
      const segundosRestantes = registro.bloqueadoHasta - ahora;
      console.log(`[2FA LOGIN] Usuario bloqueado: ${userId}, segundos restantes: ${segundosRestantes}`);
      return NextResponse.json(
        {
          error: `Demasiados intentos fallidos. Espera ${segundosRestantes} segundos.`,
          bloqueado: true,
          segundosRestantes,
        },
        { status: 429 }
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
    }).catch((e: any) => {
      console.error("[2FA LOGIN] Error en findUnique:", e.message);
      return null;
    });

    if (!usuario) {
      console.error(`[2FA LOGIN] Usuario no encontrado: ${userId}`);
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    if (!usuario.dos_fa_habilitado) {
      console.error(`[2FA LOGIN] 2FA no habilitado para usuario: ${userId}`);
      return NextResponse.json(
        { error: "2FA no está habilitado para este usuario" },
        { status: 400 }
      );
    }

    if (!usuario.dos_fa_secreto) {
      console.error(`[2FA LOGIN] Secret 2FA no encontrado para usuario: ${userId}`);
      return NextResponse.json(
        { error: "Configuración de 2FA incompleta" },
        { status: 400 }
      );
    }

    // Validar que el secret sea válido y no vacío
    const secret = usuario.dos_fa_secreto.trim();
    if (!secret || secret.length === 0) {
      console.error(`[2FA LOGIN] Secret 2FA vacío para usuario: ${userId}`);
      return NextResponse.json(
        { error: "Configuración de 2FA incompleta" },
        { status: 400 }
      );
    }

    // Verificar código TOTP (buscar en ±3 minutos como en setup)
    let esValido = false;

    for (let i = -6; i <= 6; i++) {
      const tiempoVentana = ahora + (i * 30);
      try {
        const codigoVentana = speakeasy.totp({
          secret: secret,
          encoding: "base32",
          time: tiempoVentana,
        });

        if (codigoVentana === codigo) {
          esValido = true;
          break;
        }
      } catch (err: any) {
        console.error(`[2FA LOGIN] Error generando TOTP en ventana ${i}:`, err.message);
        // Continuar con la siguiente ventana si hay error
      }
    }

    if (!esValido) {
      const actual = intentosFallidos.get(userId) ?? { intentos: 0, bloqueadoHasta: 0 };
      const nuevosIntentos = actual.intentos + 1;
 
      if (nuevosIntentos >= MAX_INTENTOS) {
        intentosFallidos.set(userId, {
          intentos: nuevosIntentos,
          bloqueadoHasta: ahora + TIEMPO_BLOQUEO_SEGUNDOS,
        });
        console.log(`[2FA LOGIN] Usuario bloqueado por ${TIEMPO_BLOQUEO_SEGUNDOS}s: ${userId}`);
        return NextResponse.json(
          {
            error: `Demasiados intentos fallidos. Espera ${TIEMPO_BLOQUEO_SEGUNDOS} segundos.`,
            bloqueado: true,
            segundosRestantes: TIEMPO_BLOQUEO_SEGUNDOS,
          },
          { status: 429 }
        );
      }
      intentosFallidos.set(userId, { intentos: nuevosIntentos, bloqueadoHasta: 0 });
 
      console.log(`[2FA LOGIN] Código inválido para usuario: ${userId}, intentos: ${nuevosIntentos}/${MAX_INTENTOS}`);
      return NextResponse.json(
        {
          error: `Código 2FA inválido o expirado. Te quedan ${MAX_INTENTOS - nuevosIntentos} intentos.`,
          intentosRestantes: MAX_INTENTOS - nuevosIntentos,
        },
        { status: 401 }
      );
    }

    // Código válido - Crear JWT y completar login
    intentosFallidos.delete(userId);
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