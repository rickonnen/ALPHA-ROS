/** Archivo: route.ts
 * Dirección: alpha-ros-deploy1\app\api\vincular\facebook\oauth-respuesta\route.ts
 * Funcionalidad: Recibe la respuesta de Facebook OAuth y vincula la cuenta
 */
import { NextRequest, NextResponse } from "next/server"
import { linkFacebook } from "@/lib/auth/linkFacebook"

export async function GET(req: NextRequest) {

  const { searchParams } = new URL(req.url)
  const code  = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  // 1. Usuario canceló en Facebook
  if (error || !code || !state) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/perfil?seccion=redes-vinculadas&error=cancelado`)
  }

  // 2. Recuperar id_usuario del state
  const id_usuario = Buffer.from(state, "base64").toString("utf-8")

  if (!id_usuario) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/perfil?seccion=redes-vinculadas&error=sesion`)
  }

  try {
    // 3. Intercambiar code por access_token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      new URLSearchParams({
        client_id:     process.env.FACEBOOK_CLIENT_ID!,
        client_secret: process.env.FACEBOOK_CLIENT_SECRET!,
        redirect_uri:  `${process.env.NEXTAUTH_URL}api/vincular/facebook/oauth-respuesta`,
        code,
      })
    )

    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/perfil?seccion=redes-vinculadas&error=token`)
    }

    // 4. Obtener datos del usuario en Facebook
    const userRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${tokenData.access_token}`
    )

    const facebookUser = await userRes.json()

    if (!facebookUser.id) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/perfil?seccion=redes-vinculadas&error=usuario`)
    }

    // 5. Llamar a linkFacebook con los datos obtenidos
    const resultado = await linkFacebook(id_usuario, {
      providerAccountId: facebookUser.id,
    })

    if (!resultado.ok) {
      const errorMsg = encodeURIComponent(resultado.error ?? "error")
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/perfil?seccion=redes-vinculadas&error=${errorMsg}`)
    }

    // 6. Todo ok → redirigir de vuelta al perfil
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/perfil?seccion=redes-vinculadas&success=facebook`)

  } catch (err) {
    console.error("Error en oauth-respuesta Facebook:", err)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/perfil?seccion=redes-vinculadas&error=servidor`)
  }
}