import CredentialsProvider from "next-auth/providers/credentials";

/**
 * Magic Link Credentials Provider
 * 
 * Valida usuario cuando viene del flujo Magic Link
 * Se ejecuta desde /auth/callback cuando llama a signIn("magic-link")
 */
export const MagicLinkProvider = CredentialsProvider({
  id: "magic-link",
  name: "Magic Link",
  credentials: {
    email: { label: "Email", type: "email" },
  },

  async authorize(credentials) {
    if (!credentials?.email) {
      return null;
    }

    try {
      const { prisma } = await import("@/lib/prisma");

      // Buscar usuario en Prisma por email
      const usuario = await prisma.usuario.findFirst({
        where: { email: credentials.email.toLowerCase() },
      });

      if (!usuario) {
        console.error("[Magic Link Auth] Usuario no encontrado:", credentials.email);
        return null;
      }

      // Validar que no esté bloqueado
      if (usuario.estado !== 1) {
        console.error("[Magic Link Auth] Usuario bloqueado:", usuario.id_usuario);
        return null;
      }

      // Retornar usuario para NextAuth
      return {
        id: usuario.id_usuario,
        email: usuario.email,
        name: usuario.nombres || "Usuario",
      };

    } catch (error) {
      console.error("[Magic Link Auth] Error:", error);
      return null;
    }
  },
});