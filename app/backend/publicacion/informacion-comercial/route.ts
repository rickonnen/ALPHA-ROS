/**
 * @Dev: [BenjaminA]
 * @Fecha: 28/03/2026
 * @Funcionalidad: Definición de rutas del endpoint de Información Comercial.
 * Expone el método POST para crear publicaciones y rechaza otros métodos HTTP.
 */

import { NextRequest } from "next/server";
import { crearInformacionComercialController } from "./publicacion.controller";

/**
 * @Funcionalidad: Maneja las peticiones POST al endpoint de información comercial
 * @param {NextRequest} req - Request de Next.js
 * @return {NextResponse} Respuesta del controlador
 */
export async function POST(req: NextRequest) {
  return crearInformacionComercialController(req);
}

/**
 * @Funcionalidad: Rechaza peticiones GET al endpoint — solo se permite POST
 * @return {Response} Respuesta 405 Method Not Allowed
 */
export async function GET() {
  return new Response(
    JSON.stringify({ ok: false, mensaje: "Método no permitido." }),
    { status: 405, headers: { "Content-Type": "application/json", Allow: "POST" } }
  );
}