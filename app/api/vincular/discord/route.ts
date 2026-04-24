/** Archivo: route.ts
 * Dirección: alpha-ros-deploy1\app\api\vincular\discord\route.ts
 * Funcionalidad: Inicia el flujo OAuth de Discord para vincular desde perfil
 */
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)

  // 1. Verificar que hay sesión activa
  //const session = await getServerSession()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    )
  }

  // 2. Guardar id_usuario en state para recuperarlo en el callback
  const state = Buffer.from(session.user.id).toString("base64")

  // 3. Construir URL de autorización de Discord
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/vincular/discord/callback`,
    response_type: "code",
    scope: "identify email",
    state,
  })

  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`

  // 4. Redirigir al OAuth de Discord
  return NextResponse.redirect(discordAuthUrl)
}