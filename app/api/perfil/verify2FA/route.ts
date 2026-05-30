import { NextRequest, NextResponse } from "next/server";
import speakeasy from "speakeasy";
import { prisma } from "@/lib/prisma";

// Mapa en memoria para rastrear intentos fallidos 
const intentosFallidos = new Map<string, { intentos: number; bloqueadoHasta: number }>();

const MAX_INTENTOS = 5;
const TIEMPO_BLOQUEO_SEGUNDOS = 60; // 1 minuto

export async function POST(request: NextRequest) {
  try {
    const { id_usuario, secreto, codigo } = await request.json();

    if (!id_usuario || !secreto || !codigo) {
      return NextResponse.json(
        { esValido: false, error: "Parámetros incompletos" },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(codigo)) {
      return NextResponse.json(
        { esValido: false, error: "Código debe ser 6 dígitos" },
        { status: 400 }
      );
    }

    // Verificar si el usuario está bloqueado
    const ahora = Math.floor(Date.now() / 1000);
    const registro = intentosFallidos.get(id_usuario);

    if (registro?.bloqueadoHasta && ahora < registro.bloqueadoHasta) {
      const segundosRestantes = registro.bloqueadoHasta - ahora;
      return NextResponse.json(
        {
          esValido: false,
          bloqueado: true,
          segundosRestantes,
          error: `Demasiados intentos fallidos. Espera ${segundosRestantes} segundos.`,
        },
        { status: 429 }
      );
    }

    // Verificar código TOTP con tolerancia de ±60 segundos
    // window: 2 acepta códigos de hasta hace 60 segundos (permite sincronización de tiempo)
    const esValido = speakeasy.totp.verify({
      secret: secreto,
      encoding: "base32",
      token: codigo,
      window: 2, // Permite ±2 ventanas (±60 segundos) para sincronización de tiempo
    });

    // Manejar intentos fallidos / exitosos
    if (!esValido) {
      const actual = intentosFallidos.get(id_usuario) ?? { intentos: 0, bloqueadoHasta: 0 };
      const nuevosIntentos = actual.intentos + 1;

      if (nuevosIntentos >= MAX_INTENTOS) {
        intentosFallidos.set(id_usuario, {
          intentos: nuevosIntentos,
          bloqueadoHasta: ahora + TIEMPO_BLOQUEO_SEGUNDOS,
        });
        return NextResponse.json(
          {
            esValido: false,
            bloqueado: true,
            segundosRestantes: TIEMPO_BLOQUEO_SEGUNDOS,
            error: `Demasiados intentos fallidos. Espera ${TIEMPO_BLOQUEO_SEGUNDOS} segundos.`,
          },
          { status: 429 }
        );
      }

      intentosFallidos.set(id_usuario, { intentos: nuevosIntentos, bloqueadoHasta: 0 });

      return NextResponse.json({
        esValido: false,
        intentosRestantes: MAX_INTENTOS - nuevosIntentos,
        message: `Código inválido. Te quedan ${MAX_INTENTOS - nuevosIntentos} intentos.`,
      });
    }

    // Código válido → limpiar intentos
    intentosFallidos.delete(id_usuario);

    // Guardar en BD
    try {
      await (prisma.usuario.update as any)({
        where: { id_usuario },
        data: {
          dos_fa_secreto: secreto,
          dos_fa_habilitado: true,
        },
      });
      console.log(`[2FA] ✓ 2FA activado para usuario: ${id_usuario}`);
    } catch (dbError: any) {
      if (dbError.message?.includes("dos_fa") || dbError.code === "P1047") {
        console.warn("[2FA] Campos 2FA no existen aún en BD.");
      } else {
        console.error("[2FA] Error guardando en BD:", dbError);
        return NextResponse.json(
          { esValido: false, error: "Error guardando configuración" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      esValido: true,
      message: "✓ 2FA activado correctamente",
    });

  } catch (error) {
    console.error("[2FA] Error verificando código:", error);
    return NextResponse.json(
      { esValido: false, error: "Error interno" },
      { status: 500 }
    );
  }
}