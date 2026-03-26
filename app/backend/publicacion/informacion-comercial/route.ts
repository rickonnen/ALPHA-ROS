// app/api/publicacion/informacion-comercial/route.ts

import { NextRequest } from "next/server";
import { crearInformacionComercialController } from "./publicacion.controller";

export async function POST(req: NextRequest) {
  return crearInformacionComercialController(req);
}

export async function GET() {
  return new Response(
    JSON.stringify({ ok: false, mensaje: "Método no permitido." }),
    { status: 405, headers: { "Content-Type": "application/json", Allow: "POST" } }
  );
}