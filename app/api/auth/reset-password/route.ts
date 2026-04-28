import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { enviarCambioContrasena } from "@/lib/email/emailService";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  if (password.length < 8 || password.length > 15) return NextResponse.json({ error: "Entre 8 y 15 caracteres" }, { status: 400 });
  if (!/[A-Z]/.test(password)) return NextResponse.json({ error: "Debe incluir al menos una mayúscula" }, { status: 400 });
  if (!/[0-9]/.test(password)) return NextResponse.json({ error: "Debe incluir al menos un número" }, { status: 400 });

  const normalizedEmail = email.toLowerCase().trim();

  // Verificar si la nueva contraseña es igual a la anterior
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password: password,
  });

  if (!signInError) {
    return NextResponse.json(
      { error: "La nueva contraseña no puede ser igual a la anterior." },
      { status: 400 }
    );
  }

  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users?.users.find(u => u.email === normalizedEmail);
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  const { error } = await supabase.auth.admin.updateUserById(user.id, { password });
  if (error) return NextResponse.json({ error: "Error al actualizar contraseña" }, { status: 500 });

  await enviarCambioContrasena(normalizedEmail, normalizedEmail.split("@")[0]);

  return NextResponse.json({ success: true, message: "Tu contraseña fue actualizada correctamente" });
}