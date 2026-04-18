import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

interface RegistrarSesionTelemetryParams {
  request: NextRequest;
  idUsuario: string;
  latitud?: unknown;
  longitud?: unknown;
}

function getClientIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    return firstIp || null;
  }

  return realIp?.trim() || null;
}

function toNullableCoordinate(value: unknown): Prisma.Decimal | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsedValue =
    typeof value === "number" ? value : Number.parseFloat(String(value));

  if (!Number.isFinite(parsedValue)) {
    return null;
  }

  return new Prisma.Decimal(parsedValue);
}

export async function registrarSesionTelemetry({
  request,
  idUsuario,
  latitud,
  longitud,
}: RegistrarSesionTelemetryParams): Promise<void> {
  try {
    await prisma.sesion.create({
      data: {
        id_usuario: idUsuario,
        latitud: toNullableCoordinate(latitud),
        longitud: toNullableCoordinate(longitud),
        ip: getClientIp(request),
      },
    });
  } catch (error) {
    console.error("[SESSION_TELEMETRY] No se pudo registrar la sesion:", error);
  }
}
