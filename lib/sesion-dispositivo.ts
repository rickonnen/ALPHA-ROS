import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

interface RegistrarSesionParams {
  id_usuario: string;
  token_hash: string;          // access_token de Supabase
  ip: string;
  user_agent?: string | null;
}

export async function registrarSesionDispositivo({
  id_usuario,
  token_hash,
  ip,
  user_agent,
}: RegistrarSesionParams) {
  // Detectar tipo de dispositivo desde User-Agent
  const ua = (user_agent ?? "").toLowerCase();
  let dispositivo = "desktop";
  if (/mobile|android|iphone|ipad/.test(ua)) dispositivo = "mobile";
  else if (/tablet/.test(ua)) dispositivo = "tablet";

  // Detectar navegador
  let navegador: string | null = null;
  if (ua.includes("chrome")) navegador = "Chrome";
  else if (ua.includes("firefox")) navegador = "Firefox";
  else if (ua.includes("safari")) navegador = "Safari";
  else if (ua.includes("edge")) navegador = "Edge";
  else if (ua.includes("app mercader") || ua.includes("mercader")) {
    navegador = null; // es app nativa
  }

  // Detectar si es app nativa
  const app_name = ua.includes("mercader") ? "App Mercader" : null;

  // GeoIP — en Supabase/Vercel se puede usar la librería @vercel/edge o maxmind
  // Aquí dejamos ciudad/pais como null por simplicidad.
  // Reemplaza con tu proveedor de GeoIP favorito.
  const ciudad: string | null = null;
  const pais: string | null = null;

  // Upsert: si ya existe un registro con ese token_hash, actualizamos ultimo_acceso
  await prisma.sesionDispositivo.upsert({
    where: { id_sesion_dispositivo: token_hash }, // usa token como clave si es único
    update: { ultimo_acceso: new Date() },
    create: {
      id_usuario,
      token_hash,
      ip,
      ciudad,
      pais,
      dispositivo,
      navegador,
      app_name,
    },
  });
}