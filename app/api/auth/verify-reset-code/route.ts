import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    if (!/^\d{6}$/.test(code)) return NextResponse.json({ error: "Código inválido" }, { status: 400 });

    const normalizedEmail = email.toLowerCase().trim();

    const { data: usuario } = await supabase
      .from("Usuario")
      .select("id_usuario")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (!usuario) return NextResponse.json({ error: "Código incorrecto" }, { status: 400 });

    const { data: record } = await supabase
      .from("Recuperacion_password")
      .select("id_recuperacion, fecha_expiracion")
      .eq("codigo", code)
      .eq("id_usuario", usuario.id_usuario)
      .eq("usado", false)
      .single();

    if (!record) return NextResponse.json({ error: "Código incorrecto o ya usado" }, { status: 400 });

    if (new Date() > new Date(record.fecha_expiracion))
      return NextResponse.json({ error: "El código ha expirado. Solicita uno nuevo." }, { status: 400 });

    await supabase.from("Recuperacion_password").update({ usado: true }).eq("id_recuperacion", record.id_recuperacion);

    return NextResponse.json({ success: true, email: normalizedEmail });

  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}