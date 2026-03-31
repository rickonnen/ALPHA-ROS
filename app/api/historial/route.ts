import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: "Hola desde el historial" });
}

// O si es un POST
export async function POST(request: Request) {
  // tu lógica aquí
  return NextResponse.json({ success: true });
}