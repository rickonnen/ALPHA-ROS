/** Archivo: route.ts
 * Dirección: alpha-ros-deploy1\app\api\vincular\discord\route.ts
 * Funcionalidad: Inicia el flujo OAuth de Discord para vincular desde perfil
 */
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
//import { NextResponse } from "next/server"
import { NextRequest, NextResponse } from "next/server"  
import { verify } from "jsonwebtoken"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  let id_usuario: string | null = session?.user?.id ?? null

  if (!id_usuario) {
    const token = request.cookies.get("auth_token")?.value
    if (token) {
      try {
        const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string }
        id_usuario = decoded.userId
      } catch {}
    }
  }

  if (!id_usuario) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const state = Buffer.from(id_usuario).toString("base64")
  // 3. Construir URL de autorización de Discord
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    redirect_uri: `${process.env.NEXTAUTH_URL}api/vincular/discord/oauth-respuesta`,
    response_type: "code",
    scope: "identify email",
    state,
  })

  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`

  // 4. Redirigir al OAuth de Discord
  return NextResponse.redirect(discordAuthUrl)
}
