import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Dominios permitidos
const DOMINIOS_PERMITIDOS = [
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "live.com",
  "office365.com",
  "yahoo.com",
];

/**
 * POST /api/auth/magic-link
 * 
 * Recibe email, valida rate limit (max 3/hora), 
 * solicita Magic Link a Supabase, guarda intento con expiración
 * 
 * Dominios permitidos: gmail, outlook, hotmail, icloud, live, office365, yahoo, .edu
 */
export async function POST(req: NextRequest) {
  try {
    //  Obtener email del request
    const { email } = await req.json();

    //  Validar que email no esté vacío
    if (!email || email.trim() === "") {
      return NextResponse.json(
        { 
          error: "Email requerido. Dominios válidos: gmail.com, outlook.com, hotmail.com, icloud.com, live.com, office365.com, yahoo.com, .edu" 
        },
        { status: 400 }
      );
    }

    // Validar formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    //Validar que sea un dominio permitido
    const emailLower = email.toLowerCase();
    const dominio = emailLower.split("@")[1];
    
    const esDoominioPermitido = 
      DOMINIOS_PERMITIDOS.includes(dominio) || 
      dominio.endsWith(".edu");

    if (!esDoominioPermitido) {
      return NextResponse.json(
        { 
          error: "Email no permitido. Dominios válidos: gmail.com, outlook.com, hotmail.com, icloud.com, live.com, office365.com, yahoo.com, dominios .edu" 
        },
        { status: 400 }
      );
    }

    //  RATE LIMIT: Verificar máximo 3 intentos por hora
    const unaHoraAtras = new Date(Date.now() - 60 * 60 * 1000);

    const intentosRecientes = await prisma.magicLinkAttempt.count({
      where: {
        email: emailLower,
        sentAt: {
          gte: unaHoraAtras,
        },
      },
    });

    if (intentosRecientes >= 3) {
      return NextResponse.json(
        { error: "Demasiados intentos. Intenta nuevamente en 1 hora" },
        { status: 429 }
      );
    }

    // Generar token seguro
    // Crear un token único combinando email + timestamp + random
    const tokenBase = `${emailLower}:${Date.now()}:${crypto.randomBytes(32).toString('hex')}`;
    const tokenHash = crypto.createHash('sha256').update(tokenBase).digest('hex');

    console.log("[Magic Link] Token generado para:", emailLower);

    // Llamar a Supabase para enviar Magic Link
    const { error: supabaseError } = await supabase.auth.signInWithOtp({
      email: emailLower,
      options: {
        emailRedirectTo: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/callback`,
      },
    });

    if (supabaseError) {
      console.error("[Magic Link] Error de Supabase:", supabaseError.message);
      return NextResponse.json(
        { error: "Error al enviar Magic Link. Intenta nuevamente" },
        { status: 500 }
      );
    }

    // Calcular expiración (15 minutos)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    //  Obtener IP del request
    const ipAddress = req.headers.get('x-forwarded-for') || 
                      req.headers.get('x-real-ip') || 
                      'unknown';

    // Obtener User Agent
    const userAgent = req.headers.get('user-agent') || '';

    // Guardar intento en la BD (auditoría + rate limit + expiración)
    await prisma.magicLinkAttempt.create({
      data: {
        email: emailLower,
        token: tokenHash,
        sentAt: new Date(),
        expiresAt: expiresAt,
        status: "pending",
        ipAddress: ipAddress,
        userAgent: userAgent,
      },
    });

    console.log("[Magic Link] Intento guardado:", { email: emailLower, expiresAt });

    // Retornar éxito
    return NextResponse.json(
      {
        success: true,
        message: `Magic Link enviado a ${email}. Válido por 15 minutos.`,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("[Magic Link] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}