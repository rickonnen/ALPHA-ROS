/** Archivo: dbInstance.ts
 * Dirección: alpha-ros-deploy1\lib\auth\dbInstance.ts
 * Funcionalidad: Instancia única del cliente de Supabase con permisos de admin
 */
import { createClient } from "@supabase/supabase-js"

export const dbInstance = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)