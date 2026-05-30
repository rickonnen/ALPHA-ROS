import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
//import { createAdminClient } from "@/lib/supabase/admin"; // Service Role

export async function POST_cerrar(req: NextRequest) {
  const body = await req.json();
  const { id_usuario, id_sesion_dispositivo } = body;

  if (!id_usuario || !id_sesion_dispositivo) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  // Verificar que pertenece al usuario
  const sesion = await prisma.sesionDispositivo.findFirst({
    where: { id_sesion_dispositivo, id_usuario },
  });

  if (!sesion) {
    return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
  }

  // Eliminar registro local
  await prisma.sesionDispositivo.delete({
    where: { id_sesion_dispositivo },
  });

  // Opcional: invalidar sesión en Supabase Auth usando el token_hash
  // si guardaste el session_id de Supabase en token_hash:
  // const supabase = createAdminClient();
  // await supabase.auth.admin.signOut(sesion.token_hash!, "local");

  // Notificar al dispositivo cerrado (event "sesion:expirada")
  // Esto se haría via WebSocket / Supabase Realtime en producción.
  // Por ahora la próxima petición del dispositivo recibirá 401.

  return NextResponse.json({ ok: true });
}