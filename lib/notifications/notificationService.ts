export async function crearNotificacion({
  id_usuario,
  titulo,
  mensaje,
  id_categoria = 1,
}: {
  id_usuario: string;
  titulo: string;
  mensaje: string;
  id_categoria?: number;
}): Promise<void> {

  // ← Mover aquí adentro, igual que en nextauth/route.ts
  const { createClient } = await import("@supabase/supabase-js");
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from("Notificacion")
    .insert({
      id_usuario,
      titulo,
      mensaje,
      id_categoria,
    });

  if (error) {
    console.error("[NOTIFICACION]  Error creando notificación:", error);
  } else {
  }
}