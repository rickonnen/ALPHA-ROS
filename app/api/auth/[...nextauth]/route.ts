import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"
const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account"
        }
      }
    }),
  ],

  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider !== "google") return false
      if (!user.email) return false

      try {
        const usuarioExistente = await prisma.usuario.findFirst({
          where: { email: user.email },
        })

        if (usuarioExistente) {
          if (!usuarioExistente.google_id) {
            await prisma.usuario.update({
              where: { id_usuario: usuarioExistente.id_usuario },
              data: { google_id: account.providerAccountId },
            })
          }
          return true
        }

        const nombreCompleto = user.name ?? ""
        const partes = nombreCompleto.trim().split(" ")
        const nombres = partes[0] ?? ""
        const apellidos = partes.slice(1).join(" ") ?? ""

        const rolCliente = await prisma.rol.findFirst({
          where: { nombre_rol: "Cliente" },
        })

        await prisma.usuario.create({
          data: {
            id_usuario: user.id,
            email: user.email,
            nombres,
            apellidos,
            google_id: account.providerAccountId,
            url_foto_perfil: user.image ?? null,
            rol: rolCliente?.id_rol ?? null,
            estado: 1,
          },
        })

        return true
      } catch (error) {
        console.error("Error en signIn callback:", error)
        return false
      }
    },

    async session({ session, token }: any) {
      if (token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },

pages: {
  signIn: "/",
  error: "/",
},
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }