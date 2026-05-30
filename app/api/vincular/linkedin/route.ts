/** Direccion: alpha-ros-deploy1\app\api\vincular\linkedin\route.ts */
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
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

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    redirect_uri: `${process.env.NEXTAUTH_URL}api/vincular/linkedin/oauth-respuesta`,
    state,
    scope: "openid profile email",
  })

  const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`

  return NextResponse.redirect(linkedInAuthUrl)
}