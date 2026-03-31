import { createClient } from "@supabase/supabase-js";

function getSupabaseAdminEnv() {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Missing Supabase URL. Set SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL."
    );
  }

  if (!supabaseServiceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Set it in your server environment."
    );
  }

  return { supabaseUrl, supabaseServiceRoleKey };
}

export function createSupabaseAdminClient() {
  const { supabaseUrl, supabaseServiceRoleKey } = getSupabaseAdminEnv();

  return createClient(supabaseUrl, supabaseServiceRoleKey);
}
