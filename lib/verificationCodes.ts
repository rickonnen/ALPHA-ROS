import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function saveVerificationCode(email: string): Promise<{ code: string; expiresAt: number }> {
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutos

  const { error } = await supabaseAdmin
    .from("verification_codes")
    .upsert([{ email, code, expires_at: expiresAt.toISOString() }], { onConflict: "email" });

  if (error) {
    console.error("[VERIFICATION] Error guardando código:", error);
    throw new Error("No se pudo guardar el código de verificación");
  }

  console.log('[[VERIFICATION] Código guardado en Supabase para ${email');
  return { code, expiresAt: expiresAt.getTime() };
}

export async function verifyCode(email: string, code: string): Promise<{ valid: boolean; error?: string }> {
  const { data, error } = await supabaseAdmin
    .from("verification_codes")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !data) {
    return { valid: false, error: "No hay código de verificación pendiente para este email" };
  }

  if (new Date() > new Date(data.expires_at)) {
    await supabaseAdmin.from("verification_codes").delete().eq("email", email);
    return { valid: false, error: "El código ha expirado. Solicita uno nuevo." };
  }

  if (data.code !== code) {
    return { valid: false, error: "El código es incorrecto" };
  }

  // Eliminar código usado
  await supabaseAdmin.from("verification_codes").delete().eq("email", email);
  return { valid: true };
}