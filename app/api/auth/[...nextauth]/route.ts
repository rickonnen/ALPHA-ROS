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
        params: { prompt: "select_account" },
      },
    }),
  ],

  callbacks: {

    // 🔥 SIGN IN
    async signIn({ user, account }: any) {

      try {

        if (account?.provider === "google") {

          const { createClient } = await import("@supabase/supabase-js")

          const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          )

          // 🔎 Verificar si ya existe
          const { data: existing } = await supabase
            .from("Usuario")
            .select("id_usuario")
            .eq("email", user.email)
            .maybeSingle()

          // 🆕 Crear usuario si no existe
          if (!existing) {

            await supabase.from("Usuario").insert({
              id_usuario: account.providerAccountId,
              email: user.email,
              nombres: user.name?.split(" ")[0] ?? "",
              apellidos:
                user.name?.split(" ").slice(1).join(" ") ?? "",
              google_id: account.providerAccountId,
              url_foto_perfil: user.image ?? null,
              rol: 2,
              estado: 1,
            })

            console.log("Usuario creado en tabla Usuario")

          }

        }

        return true

      } catch (error) {

        console.error("Error signIn:", error)
        return false

      }

    },

    // 🔥 JWT (GUARDAR ID CORRECTO)
    async jwt({ token, account }: any) {

      if (account) {

        token.id = account.providerAccountId

      }

      return token

    },

    // 🔥 SESSION (ENVIAR ID AL FRONTEND)
    async session({ session, token }: any) {

      if (session.user) {

        session.user.id = token.id as string

      }

      return session

    },

  },

  pages: {
    signIn: "/",
    error: "/",
  },

})

export { handler as GET, handler as POST }
