import { createClient } from "@supabase/supabase-js";

export const supabaseHome = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_HOME_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_HOME_ANON_KEY!,
  {
    auth: {
      persistSession: false,
    },
  }
);