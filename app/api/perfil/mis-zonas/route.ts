import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verify } from "jsonwebtoken";

const prisma = new PrismaClient();
const ZONE_NAME_PATTERN = /^[A-Za-z0-9]+$/;
const ZONE_NAME_MAX_LENGTH = 50;

function normalizeZoneName(value: string): string {
  return value.trim().toLowerCase();
}

function isValidCoordinatePair(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number" &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1])
  );
}

function getPolygonSignature(coordinates: [number, number][]): string {
  return JSON.stringify(
    coordinates.map(([lat, lng]) => [
      Number(lat.toFixed(6)),
      Number(lng.toFixed(6)),
    ]),
  );
}

export async function GET(req: NextRequest) {
  try {
    const authToken = req.cookies.get("auth_token")?.value;

    if (!authToken) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const decoded = verify(authToken, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const id_usuario = decoded.userId;

    const zonas = await prisma.misZonas.findMany({
      where: { id_usuario },
      orderBy: { fecha_creacion: "desc" },
    });

    return NextResponse.json({ data: zonas });
  } catch (error) {
    console.error("Error al obtener zonas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authToken = req.cookies.get("auth_token")?.value;

    if (!authToken) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const decoded = verify(authToken, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const id_usuario = decoded.userId;
    const { nombre_zona, coordenadas } = await req.json();
    const cleanZoneName =
      typeof nombre_zona === "string" ? nombre_zona.trim() : "";

    if (!cleanZoneName || !coordenadas) {
      return NextResponse.json(
        { error: "Faltan parámetros: nombre_zona o coordenadas" },
        { status: 400 },
      );
    }

    if (cleanZoneName.length > ZONE_NAME_MAX_LENGTH) {
      return NextResponse.json(
        {
          error: `El nombre de la zona no puede superar ${ZONE_NAME_MAX_LENGTH} caracteres.`,
        },
        { status: 400 },
      );
    }

    if (!ZONE_NAME_PATTERN.test(cleanZoneName)) {
      return NextResponse.json(
        {
          error:
            "El nombre de la zona solo puede contener letras y números, sin espacios ni caracteres especiales.",
        },
        { status: 400 },
      );
    }

    if (
      !Array.isArray(coordenadas) ||
      coordenadas.length < 3 ||
      !coordenadas.every(isValidCoordinatePair)
    ) {
      return NextResponse.json(
        { error: "Las coordenadas de la zona no son válidas." },
        { status: 400 },
      );
    }

    const existingZones = await prisma.misZonas.findMany({
      where: { id_usuario },
      select: {
        nombre_zona: true,
        coordenadas: true,
      },
    });

    const normalizedZoneName = normalizeZoneName(cleanZoneName);
    const newPolygonSignature = getPolygonSignature(coordenadas);

    const hasDuplicatedName = existingZones.some(
      (zone) =>
        typeof zone.nombre_zona === "string" &&
        normalizeZoneName(zone.nombre_zona) === normalizedZoneName,
    );

    if (hasDuplicatedName) {
      return NextResponse.json(
        { error: "Ya tienes una zona guardada con ese nombre." },
        { status: 409 },
      );
    }

    const hasDuplicatedPolygon = existingZones.some((zone) => {
      if (!Array.isArray(zone.coordenadas)) return false;
      if (!zone.coordenadas.every(isValidCoordinatePair)) return false;
      return getPolygonSignature(zone.coordenadas) === newPolygonSignature;
    });

    if (hasDuplicatedPolygon) {
      return NextResponse.json(
        { error: "Esa zona ya está guardada en tu perfil." },
        { status: 409 },
      );
    }

    const nuevaZona = await prisma.misZonas.create({
      data: {
        id_usuario,
        nombre_zona: cleanZoneName,
        coordenadas,
      },
    });

    return NextResponse.json({ data: nuevaZona });
  } catch (error) {
    console.error("Error al guardar zona:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authToken = req.cookies.get("auth_token")?.value;

    if (!authToken) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const decoded = verify(authToken, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const { searchParams } = new URL(req.url);
    const id_mi_zona = searchParams.get("id_mi_zona");

    if (!id_mi_zona) {
      return NextResponse.json(
        { error: "Falta el parámetro id_mi_zona" },
        { status: 400 },
      );
    }

    await prisma.misZonas.deleteMany({
      where: {
        id_mi_zona: parseInt(id_mi_zona),
        id_usuario: decoded.userId,
      },
    });

    return NextResponse.json({ message: "Zona eliminada" });
  } catch (error) {
    console.error("Error al eliminar zona:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
