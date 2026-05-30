/** Direccion: alpha-ros-deploy1\app\api\vincular\linkedin\oauth-respuesta\route.ts */
import { NextRequest, NextResponse } from "next/server"
import { linkLinkedIn } from "@/lib/auth/linkLinkedIn"
import { crearNotificacion } from "@/lib/notifications/notificationService"
// Para notificaciones -> import { enviarLinkedInVinculado } from "@/lib/email/emailService"
import { createClient } from "@supabase/supabase-js"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code  = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  // 1. Usuario cancelo en LinkedIn
  if (error || !code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/perfil?seccion=redes-vinculadas&error=cancelado`
    )
  }

  // 2. Recuperar id_usuario del state
  const id_usuario = Buffer.from(state, "base64").toString("utf-8")
  if (!id_usuario) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/perfil?seccion=redes-vinculadas&error=sesion`
    )
  }

  try {
    // 3. Intercambiar code por access_token
    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type:    "authorization_code",
        code,
        redirect_uri:  `${process.env.NEXTAUTH_URL}api/vincular/linkedin/oauth-respuesta`,
        client_id:     process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      }),
    })

    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/perfil?seccion=redes-vinculadas&error=token`
      )
    }

    // 4. Obtener datos del usuario en LinkedIn (OpenID Connect)
    const userRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    const linkedInUser = await userRes.json()

    if (!linkedInUser.sub) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/perfil?seccion=redes-vinculadas&error=usuario`
      )
    }

    // 5. Llamar a linkLinkedIn con los datos obtenidos
    const resultado = await linkLinkedIn(id_usuario, {
      providerAccountId: linkedInUser.sub,
    })

    if (!resultado.ok) {
      const errorMsg = encodeURIComponent(resultado.error ?? "error")
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/perfil?seccion=redes-vinculadas&error=${errorMsg}`
      )
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: usuario } = await supabase
      .from("Usuario")
      .select("nombres, email")
      .eq("id_usuario", id_usuario)
      .maybeSingle()

    /*if (usuario) {
      await enviarLinkedInVinculado(usuario.email, usuario.nombres)
      await crearNotificacion({
        id_usuario,
        titulo: "LinkedIn vinculado",
        mensaje: "Tu cuenta ha sido vinculada exitosamente con LinkedIn.",
        id_categoria: 5,
      })
    }*/

    // 6. Todo ok → redirigir de vuelta al perfil
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/perfil?seccion=redes-vinculadas&success=linkedin`
    )
  } catch (err) {
    console.error("Error en oauth-respuesta LinkedIn:", err)
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/perfil?seccion=redes-vinculadas&error=servidor`
    )
  }
}
