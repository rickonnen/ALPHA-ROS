import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { enviarBienvenidaGoogle } from "@/lib/email/emailService";
import { crearNotificacion } from "@/lib/notifications/notificationService";

const handler = NextAuth({
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
          if (!userData) return null
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
      console.log("🔵 signIn Google iniciado:", user?.email)

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
            .select("id_usuario, google_id")
            .eq("email", user.email)
            .maybeSingle()

          console.log("👤 existingUser:", existingUser)

          // Caso 1: Ya se registró con Google antes → solo dejar pasar
          if (existingUser?.google_id) {
            return true
          }

          const nombre = user.name?.split(" ")[0] ?? "";

          // Caso 2: Existe pero sin google_id → primera vez con Google
          if (existingUser && !existingUser.google_id) {
            await supabase
              .from("Usuario")
              .update({
                google_id: account.providerAccountId,
                url_foto_perfil: user.image ?? null,
              })
              .eq("id_usuario", existingUser.id_usuario)

            console.log("📧 Primera vez con Google, enviando bienvenida a:", user.email)
            await enviarBienvenidaGoogle(user.email!, nombre);
            await crearNotificacion({
              id_usuario: existingUser.id_usuario,
              titulo: "Bienvenido a PROBOL",
              mensaje: `¡Hola ${nombre}! Te registraste exitosamente usando Google. Bienvenido a la plataforma.`,
              id_categoria: 1,
            });
            return true
          }

          // Caso 3: Usuario completamente nuevo
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: user.email!,
            email_confirm: true,
            user_metadata: {
              nombre: nombre,
              apellido: user.name?.split(" ").slice(1).join(" ") ?? "",
            }
          })

          console.log("🆔 supabaseUserId:", authData?.user?.id)

          if (authError) {
            console.error("Error creando en auth.users:", authError)
            return false
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
            return false
          }

          console.log("📧 Enviando bienvenida Google a:", user.email)
          await enviarBienvenidaGoogle(user.email!, nombre);
          await crearNotificacion({
            id_usuario: supabaseUserId,
            titulo: "Bienvenido a PROBOL",
            mensaje: `¡Hola ${nombre}! Te registraste exitosamente usando Google. Bienvenido a la plataforma.`,
            id_categoria: 1,
          });
        }
        return true
      } catch (error) {
        console.error("Error signIn Google:", error)
        return false
      }
    },

    async jwt({ token, account, user }: any) {
      if (user?.id) {
        token.id = user.id;
      }
      if (account?.provider === "google" && user?.email) {
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
    signIn: "/",
    error: "/",
  },

})

export { handler as GET, handler as POST }