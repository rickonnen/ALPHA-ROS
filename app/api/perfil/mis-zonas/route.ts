import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verify } from "jsonwebtoken";

const prisma = new PrismaClient();
const ZONE_NAME_PATTERN = /^[A-Za-z0-9]+$/;
const ZONE_NAME_MAX_LENGTH = 50;
const MIN_ZONE_POINTS = 4;
const MAX_ZONE_POINTS = 10;

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
      coordenadas.length < MIN_ZONE_POINTS ||
      coordenadas.length > MAX_ZONE_POINTS ||
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

export async function PATCH(req: NextRequest) {
  try {
    const authToken = req.cookies.get("auth_token")?.value;

    if (!authToken) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const decoded = verify(authToken, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const { id_mi_zona, nombre_zona, coordenadas } = await req.json();
    const zoneId = Number(id_mi_zona);

    if (!Number.isInteger(zoneId)) {
      return NextResponse.json(
        { error: "El id_mi_zona no es vÃ¡lido." },
        { status: 400 },
      );
    }

    const zoneToUpdate = await prisma.misZonas.findFirst({
      where: {
        id_mi_zona: zoneId,
        id_usuario: decoded.userId,
      },
    });

    if (!zoneToUpdate) {
      return NextResponse.json(
        { error: "Zona no encontrada." },
        { status: 404 },
      );
    }

    const updatePayload: {
      nombre_zona?: string;
      coordenadas?: [number, number][];
    } = {};

    if (nombre_zona !== undefined) {
      const cleanZoneName =
        typeof nombre_zona === "string" ? nombre_zona.trim() : "";

      if (!cleanZoneName) {
        return NextResponse.json(
          { error: "Ingresa un nombre para la zona." },
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
              "El nombre de la zona solo puede contener letras y nÃºmeros, sin espacios ni caracteres especiales.",
          },
          { status: 400 },
        );
      }

      const existingZones = await prisma.misZonas.findMany({
        where: {
          id_usuario: decoded.userId,
        },
        select: {
          id_mi_zona: true,
          nombre_zona: true,
        },
      });

      const normalizedZoneName = normalizeZoneName(cleanZoneName);
      const hasDuplicatedName = existingZones.some(
        (zone) =>
          zone.id_mi_zona !== zoneId &&
          typeof zone.nombre_zona === "string" &&
          normalizeZoneName(zone.nombre_zona) === normalizedZoneName,
      );

      if (hasDuplicatedName) {
        return NextResponse.json(
          { error: "Ya tienes una zona guardada con ese nombre." },
          { status: 409 },
        );
      }

      updatePayload.nombre_zona = cleanZoneName;
    }

    if (coordenadas !== undefined) {
      if (
        !Array.isArray(coordenadas) ||
        coordenadas.length < MIN_ZONE_POINTS ||
        coordenadas.length > MAX_ZONE_POINTS ||
        !coordenadas.every(isValidCoordinatePair)
      ) {
        return NextResponse.json(
          { error: "Las coordenadas de la zona no son vÃ¡lidas." },
          { status: 400 },
        );
      }

      const existingZones = await prisma.misZonas.findMany({
        where: {
          id_usuario: decoded.userId,
          id_mi_zona: { not: zoneId },
        },
        select: {
          coordenadas: true,
        },
      });

      const newPolygonSignature = getPolygonSignature(coordenadas);
      const hasDuplicatedPolygon = existingZones.some((zone) => {
        if (!Array.isArray(zone.coordenadas)) return false;
        if (!zone.coordenadas.every(isValidCoordinatePair)) return false;
        return getPolygonSignature(zone.coordenadas) === newPolygonSignature;
      });

      if (hasDuplicatedPolygon) {
        return NextResponse.json(
          { error: "Esa zona ya estÃ¡ guardada en tu perfil." },
          { status: 409 },
        );
      }

      updatePayload.coordenadas = coordenadas;
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { error: "No hay cambios para actualizar." },
        { status: 400 },
      );
    }

    const updatedZone = await prisma.misZonas.update({
      where: {
        id_mi_zona: zoneId,
      },
      data: updatePayload,
    });

    return NextResponse.json({ data: updatedZone });
  } catch (error) {
    console.error("Error al actualizar zona:", error);
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
