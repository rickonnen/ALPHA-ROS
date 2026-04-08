import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

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
  ],

  callbacks: {

    async signIn({ user, account }: any) {
      if (!account) {
        return "/api/google-cancelado"
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
        }
        return true
      } catch (error) {
        console.error("Error signIn Google:", error)
        return "/api/google-cancelado"
      }
    },

    async jwt({ token, account, user }: any) {
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

})

export { handler as GET, handler as POST }