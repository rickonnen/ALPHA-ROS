import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarMagicLink } from "@/lib/email/emailService";
import crypto from "crypto";

// Dominios permitidos para Magic Link
const ALLOWED_DOMAINS = [
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
 * Genera un Magic Link y lo envía por email
 * 
 * Request body: { email: string }
 * Response: { success: true, message: string, email: string }
 * 
 * Validaciones:
 * - Email válido
 * - Dominio permitido
 * - Rate limit (máx 3 intentos/hora)
 * - Genera token seguro
 * - Guarda intento en BD (cuando tabla exista)
 * - Envía email con link
 */
export async function POST(req: NextRequest) {
  try {
    // 1️ Parsear y validar request
    const { email } = await req.json();

    if (!email || email.trim() === "") {
      return NextResponse.json(
        { error: "El email es requerido" },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // 2️ Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLower)) {
      console.warn("[Magic Link] Formato email inválido:", emailLower);
      return NextResponse.json(
        { error: "Ingresa un correo válido" },
        { status: 400 }
      );
    }

    // 3️ Validar dominio permitido
    const domain = emailLower.split("@")[1];
    const isDomainAllowed = ALLOWED_DOMAINS.some(
      (allowedDomain) =>
        domain === allowedDomain || domain.endsWith("." + allowedDomain)
    );

    if (!isDomainAllowed) {
      console.warn("[Magic Link] Dominio no permitido:", domain);
      return NextResponse.json(
        {
          error: `El dominio ${domain} no está permitido. Usa Gmail, Outlook, Yahoo, Apple o correo institucional (.edu)`,
        },
        { status: 400 }
      );
    }

    // 4️ Aplicar Rate Limit (máx 3 intentos por hora)
    const hace1Hora = new Date(Date.now() - 60 * 60 * 1000);
    let recentAttempts = 0;

    try {
      recentAttempts = await prisma.magic_link_attempt.count({
        where: {
          email: emailLower,
          sent_at: {
            gte: hace1Hora,
          },
        },
      });
    } catch {
      console.warn("[Magic Link] Rate limit deshabilitado - error al contar intentos");
    }

    if (recentAttempts >= 3) {
      console.warn("[Magic Link] Rate limit excedido para:", emailLower);
      return NextResponse.json(
        {
          error: "Demasiados intentos. Espera 1 hora antes de solicitar otro Magic Link",
        },
        { status: 429 }
      );
    }

    // 5️ Generar token seguro (32 bytes)
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // 6️ Guardar intento en BD (cuando tabla exista)
    try {
      await prisma.magic_link_attempt.deleteMany({
        where: { email: emailLower, status: "pending" },
      });
      await prisma.magic_link_attempt.create({
        data: {
          email: emailLower,
          token: tokenHash,
          sent_at: new Date(),
          expires_at: expiresAt,
          status: "pending",
        },
      });
      console.log("[Magic Link] Intento guardado para:", emailLower);
    } catch (error) {
      console.warn("[Magic Link] No se pudo guardar intento:", error);
    }

    // 7️ Construir URL del Magic Link
    const magicLinkUrl = `${process.env.NEXTAUTH_URL}/auth/callback?token=${token}&email=${encodeURIComponent(emailLower)}`;

    // 8️ Obtener nombre del usuario (si existe) o usar parte del email
    let nombre = emailLower.split("@")[0];
    try {
      const usuario = await prisma.usuario.findFirst({
        where: { email: emailLower },
      });
      if (usuario?.nombres) {
        nombre = usuario.nombres.split(" ")[0];
      }
    } catch {
      // Usuario podría no existir, continuamos con el nombre extraído del email
    }

    // 9️ Enviar email con Magic Link
    console.log("[Magic Link] Enviando email a:", emailLower);
    const emailResult = await enviarMagicLink(emailLower, magicLinkUrl, nombre);

    if (!emailResult.success) {
      console.error("[Magic Link] Error enviando email:", emailResult.error);
      return NextResponse.json(
        {
          error: "Error al enviar el Magic Link. Intenta de nuevo más tarde.",
        },
        { status: 500 }
      );
    }

    // 10️ Respuesta exitosa
    console.log(`[Magic Link] Link generado y enviado a ${emailLower} (intento ${recentAttempts + 1}/3)`);
    return NextResponse.json(
      {
        success: true,
        message: `Magic Link enviado a ${emailLower}. Revisa tu correo.`,
        email: emailLower,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("[Magic Link POST] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}