import DiscordProvider from "next-auth/providers/discord"
import FacebookProvider from "next-auth/providers/facebook"
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { NextAuthOptions } from "next-auth"

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
          if (!user?.email) return false

          const { createClient } = await import("@supabase/supabase-js")
          const supabase = createClient(
            process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          )

          const providerAccountId = account.providerAccountId as string | undefined
          if (!providerAccountId) return false

          const { data: existingByGoogle } = await supabase
            .from("Usuario")
            .select("id_usuario")
            .eq("google_id", providerAccountId)
            .maybeSingle()

          if (existingByGoogle?.id_usuario) {
            return true
          }

          const { data: existingByEmail } = await supabase
            .from("Usuario")
            .select("id_usuario")
            .eq("email", user.email)
            .maybeSingle()

          const nombre = user.name?.split(" ")[0] ?? ""
          const apellido = user.name?.split(" ").slice(1).join(" ") ?? ""

          if (existingByEmail?.id_usuario) {
            await supabase
              .from("Usuario")
              .update({
                google_id: providerAccountId,
                url_foto_perfil: user.image ?? null,
                nombres: nombre,
                apellidos: apellido,
              })
              .eq("id_usuario", existingByEmail.id_usuario)
            return true
          }

          const { data: authData, error: authError } =
            await supabase.auth.admin.createUser({
              email: user.email,
              password: crypto.randomUUID() + crypto.randomUUID(),
              email_confirm: true,
              user_metadata: { nombre, apellido },
            })

          if (authError || !authData.user) {
            console.error("Error creando usuario en Supabase Auth:", authError)
            return false
          }

          const { error: dbError } = await supabase.from("Usuario").insert({
            id_usuario: authData.user.id,
            email: user.email,
            nombres: nombre,
            apellidos: apellido,
            google_id: providerAccountId,
            url_foto_perfil: user.image ?? null,
            rol: 2,
            estado: 1,
          })

          if (dbError) {
            console.error("Error creando usuario en tabla Usuario:", dbError)
            await supabase.auth.admin.deleteUser(authData.user.id)
            return false
          }

          console.log("Usuario creado en Supabase Auth + tabla Usuario")
        }

        return true
      } catch (error) {
        console.error("Error signIn:", error)
        return false
      }
    },

    async jwt({ token, account }: any) {

      if (account?.provider === "google") {
        const { createClient } = await import("@supabase/supabase-js")
        const supabase = createClient(
          process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const providerAccountId = account.providerAccountId as string | undefined
        if (providerAccountId) {
          const { data: userRow } = await supabase
            .from("Usuario")
            .select("id_usuario")
            .eq("google_id", providerAccountId)
            .maybeSingle()

          if (userRow?.id_usuario) token.id = userRow.id_usuario
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
    signIn: "/api/google-cancelado",
    error: "/api/google-cancelado",
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }