import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

interface RegistrarSesionTelemetryParams {
  request: NextRequest;
  idUsuario: string;
  latitud?: unknown;
  longitud?: unknown;
}

function normalizeIpCandidate(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue || trimmedValue.toLowerCase() === "unknown") {
    return null;
  }

  return trimmedValue;
}

function getIpFromForwardedHeader(value: string | null): string | null {
  const normalizedValue = normalizeIpCandidate(value);
  if (!normalizedValue) {
    return null;
  }

  const forwardedForMatch = normalizedValue.match(/for=(?:"?\[?)([^\];",]+)(?:\]?"?)/i);
  return normalizeIpCandidate(forwardedForMatch?.[1] ?? null);
}

function getClientIp(request: NextRequest): string | null {
  const headerCandidates = [
    request.headers.get("x-forwarded-for")?.split(",")[0] ?? null,
    request.headers.get("x-real-ip"),
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0] ?? null,
    request.headers.get("cf-connecting-ip"),
    request.headers.get("true-client-ip"),
    request.headers.get("x-client-ip"),
    getIpFromForwardedHeader(request.headers.get("forwarded")),
  ];

  for (const candidate of headerCandidates) {
    const normalizedCandidate = normalizeIpCandidate(candidate);
    if (normalizedCandidate) {
      return normalizedCandidate;
    }
  }

  return null;
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
