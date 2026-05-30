import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { enviarRecuperacionContrasena } from "@/lib/email/emailService";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Este campo es obligatorio" }, { status: 400 });

  const normalizedEmail = email.toLowerCase().trim();
  const { data: user } = await supabase.from("Usuario").select("id_usuario, nombres").eq("email", normalizedEmail).maybeSingle();

  if (!user) return NextResponse.json({ error: "No encontramos una cuenta con este correo electrónico" }, { status: 404 });

  // ✅ FIX BUG-HU02_14: Invalidar códigos anteriores antes de crear uno nuevo
  await supabase
    .from("Recuperacion_password")
    .update({ usado: true })
    .eq("id_usuario", user.id_usuario)
    .eq("usado", false);

  const codigo = Math.floor(100000 + Math.random() * 900000).toString();
  const ahora = new Date();
  const expiracion = new Date(ahora.getTime() + 8 * 60 * 1000);

  const { error: insertError } = await supabase.from("Recuperacion_password").insert({
    id_usuario: user.id_usuario,
    codigo,
    fecha_creacion: ahora.toISOString(),
    fecha_expiracion: expiracion.toISOString(),
    usado: false,
    metodo_envio: "email"
  });

  if (insertError) {
    console.error("Error insertando código:", insertError);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await enviarRecuperacionContrasena(normalizedEmail, codigo, user.nombres || "Usuario");
  return NextResponse.json({ success: true });
}