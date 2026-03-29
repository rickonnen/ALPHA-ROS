import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fíjate que es "export async function GET", NO "export default async function"
export async function GET() {
  try {
    const planes = await prisma.planPublicacion.findMany({
      where: {
        activo: true,
      },
      orderBy: {
        precio_plan: 'asc',
      },
    });
    
    return NextResponse.json(planes);
  } catch (error) {
    console.error("Error al obtener los planes:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los planes de publicación." }, 
      { status: 500 }
    );
  }
}