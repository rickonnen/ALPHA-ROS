import DiscordProvider from "next-auth/providers/discord"
import FacebookProvider from "next-auth/providers/facebook"
import LinkedInProvider from "next-auth/providers/linkedin"
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { NextAuthOptions } from "next-auth"
import { createClient } from "@supabase/supabase-js";

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
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
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
          const { createClient } = await import("@supabase/supabase-js")
          const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          )
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })
          if (error || !data?.user) {
            console.error("Error autenticando:", error?.message)
            return null
          }
          const { data: userData } = await supabase
            .from("Usuario")
            .select("*")
            .eq("id_usuario", data.user.id)
            .maybeSingle()
          if (!userData) {
            return null
          }
          return {
            id: data.user.id,
            email: data.user.email,
            name: userData.nombres,
          }
        } catch (error) {
          console.error("Error en authorize:", error)
          return null
        }
      },
    }),
  ],

  callbacks: {

    async signIn({ user, account }: any) {
      if (!account) {
        return true
      }
      try {
        if (account?.provider === "google") {
          const { createClient } = await import("@supabase/supabase-js")
          const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          )
          const { data: existingUser } = await supabase
            .from("Usuario")
            .select("id_usuario")
            .eq("email", user.email)
            .maybeSingle()
          if (existingUser) {
            return true
          }
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: user.email!,
            email_confirm: true,
            user_metadata: {
              nombre: user.name?.split(" ")[0] ?? "",
              apellido: user.name?.split(" ").slice(1).join(" ") ?? "",
            }
          })
          if (authError) {
            console.error("Error creando en auth.users:", authError)
            return "/api/google-cancelado"
          }
          const supabaseUserId = authData.user.id
          const { error: dbError } = await supabase.from("Usuario").upsert({
            id_usuario: supabaseUserId,
            email: user.email,
            nombres: user.name?.split(" ")[0] ?? "",
            apellidos: user.name?.split(" ").slice(1).join(" ") ?? "",
            google_id: account.providerAccountId,
            url_foto_perfil: user.image ?? null,
            rol: 2,
            estado: 1,
          }, { onConflict: "id_usuario" })
          if (dbError) {
            console.error("Error insertando en tabla Usuario:", dbError)
            await supabase.auth.admin.deleteUser(supabaseUserId)
            return "/api/google-cancelado"
          }
          
         const { enviarBienvenidaGoogle } = await import("@/lib/email/emailService")
          const { crearNotificacion } = await import("@/lib/notifications/notificationService")
          const nombre = user.name?.split(" ")[0] ?? "Usuario"
          
          await enviarBienvenidaGoogle(user.email!, nombre)
          await crearNotificacion({
            id_usuario: supabaseUserId,
            titulo: "¡Bienvenido a PROPBOL!",
            mensaje: `¡Hola ${nombre}! Tu cuenta ha sido creada exitosamente con Google. Bienvenido a la plataforma.`,
            id_categoria: 1,
          })
        }
        if (account.provider === "discord") {
          const { handleDiscordSignIn } = await import("@/lib/auth/discordAuth")
          return await handleDiscordSignIn(user, account)
        }
        if (account.provider === "facebook") {
          const { handleFacebookSignIn } = await import("@/lib/auth/facebookAuth")
          return await handleFacebookSignIn(user, account)
        }
        if (account.provider === "linkedin") {
          const { handleLinkedInSignIn } = await import("@/lib/auth/linkedInAuth")
          return await handleLinkedInSignIn(user, account)
        }
        return true
      } catch (error) {
        console.error("Error signIn:", error)
        return false
      }
    },

    async jwt({ token, account, user }: any) {
      if (user?.id) {
        token.id = user.id;
      }
      if (account?.provider && user?.email) {
        const { createClient } = await import("@supabase/supabase-js")
        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        const { data } = await supabase
          .from("Usuario")
          .select("id_usuario")
          .eq("email", user.email)
          .maybeSingle()
        if (data?.id_usuario) {
          token.id = data.id_usuario
        }
      }
      return token
    },

    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string

        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const { data } = await supabase
          .from("Usuario")
          .select("estado")
          .eq("id_usuario", token.id)
          .maybeSingle();
    
        if (data?.estado === 0) {
          return null; // invalida la sesión
        }
      }
      return session
    },

    async redirect({ url, baseUrl }: any) {
      if (
        url.includes("error=Callback") ||
        url.includes("error=OAuthCallback") ||
        url.includes("access_denied")
      ) {
        return baseUrl
      }
      if (url.startsWith("/")) return `${baseUrl}${url}`
      if (url.startsWith(baseUrl)) return url
      return baseUrl
    },
  },

  pages: {
    signIn: "/api/google-cancelado",
    error: "/api/google-cancelado",
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }