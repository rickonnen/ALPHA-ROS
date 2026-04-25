import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { registrarSesionTelemetry } from "@/lib/auth/sessionTelemetry";

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const idUsuario =
      typeof token?.id === "string" ? token.id : null;

    if (!idUsuario) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const { latitud, longitud } = await request.json();

    await registrarSesionTelemetry({
      request,
      idUsuario,
      latitud,
      longitud,
    });

    return NextResponse.json(
      { message: "Telemetria de sesion registrada" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GOOGLE_SESSION_TELEMETRY] Error registrando telemetria:", error);

    return NextResponse.json(
      { error: "No se pudo registrar la telemetria de sesion" },
      { status: 500 }
    );
  }
}
