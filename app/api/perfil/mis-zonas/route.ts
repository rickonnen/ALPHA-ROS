import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verify } from "jsonwebtoken";

const prisma = new PrismaClient();

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
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
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

    if (!nombre_zona || !coordenadas) {
      return NextResponse.json({ error: "Faltan parámetros: nombre_zona o coordenadas" }, { status: 400 });
    }

    const nuevaZona = await prisma.misZonas.create({
      data: {
        id_usuario,
        nombre_zona,
        coordenadas,
      },
    });

    return NextResponse.json({ data: nuevaZona });
  } catch (error) {
    console.error("Error al guardar zona:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
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
      return NextResponse.json({ error: "Falta el parámetro id_mi_zona" }, { status: 400 });
    }

    await prisma.misZonas.delete({
      where: { id_mi_zona: parseInt(id_mi_zona) },
    });

    return NextResponse.json({ message: "Zona eliminada" });
  } catch (error) {
    console.error("Error al eliminar zona:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}