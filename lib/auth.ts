import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account consent",
          access_type: "offline",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const { createClient } = await import("@supabase/supabase-js");
          const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );

          // Autenticar contra Supabase
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error || !data?.user) {
            console.error("Error autenticando:", error?.message);
            return null;
          }

          // Obtener datos del usuario
          const { data: userData } = await supabase
            .from("Usuario")
            .select("*")
            .eq("id_usuario", data.user.id)
            .maybeSingle();

          if (!userData) {
            return null;
          }

          return {
            id: data.user.id,
            email: data.user.email,
            name: userData.nombres,
          };
        } catch (error) {
          console.error("Error en authorize:", error);
          return null;
        }
      },
    }),
    CredentialsProvider({
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
          const { createClient } = await import("@supabase/supabase-js");
          const prisma = (await import("@/lib/prisma")).prisma;

          // Bug 3: verificar que el usuario realmente consumió un token en los últimos 60 s
          const recentAttempt = await prisma.magic_link_attempt.findFirst({
            where: {
              email: credentials.email.toLowerCase(),
              status: "consumed",
              consumed_at: { gte: new Date(Date.now() - 60_000) },
            },
          });

          if (!recentAttempt) {
            console.error("[Magic Link Auth] No hay token consumido reciente para:", credentials.email);
            return null;
          }

          const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );

          // Obtener usuario de Supabase por email
          const { data: authUser, error: authError } = await supabase
            .from("auth.users")
            .select("id")
            .eq("email", credentials.email.toLowerCase())
            .maybeSingle();

          if (authError || !authUser) {
            console.error("[Magic Link Auth] Error obteniendo usuario:", authError);
            return null;
          }

          // Obtener usuario de Prisma
          const user = await prisma.usuario.findFirst({
            where: { id_usuario: authUser.id },
          });

          if (!user) {
            console.error("[Magic Link Auth] Usuario no encontrado en Prisma");
            return null;
          }

          return {
            id: user.id_usuario,
            email: user.email,
            name: user.nombres,
          };
        } catch (error) {
          console.error("[Magic Link Auth] Error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }: any) {
      // Permitir credenciales sin account
      if (!account) {
        return true;
      }
      try {
        if (account?.provider === "google") {
          const { createClient } = await import("@supabase/supabase-js");
          const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );

          const { data: existingUser } = await supabase
            .from("Usuario")
            .select("id_usuario")
            .eq("email", user.email)
            .maybeSingle();

          if (existingUser) {
            return true;
          }

          // Crear usuario si no existe
          const { data: newUser, error: insertError } = await supabase
            .from("Usuario")
            .insert({
              id_usuario: user.id,
              email: user.email,
              nombres: user.name?.split(" ")[0] || "",
              apellidos: user.name?.split(" ").slice(1).join(" ") || "",
              id_pais: 1, // Bolivia por defecto
            })
            .select()
            .single();

          if (insertError) {
            console.error("Error creando usuario:", insertError);
            return false;
          }

          return true;
        }
        return true;
      } catch (error) {
        console.error("Error en signIn:", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};