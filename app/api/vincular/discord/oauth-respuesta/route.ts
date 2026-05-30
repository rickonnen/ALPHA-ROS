/** Archivo: route.ts
 * Dirección: alpha-ros-deploy1\app\api\vincular\discord\oauth-respuesta\route.ts
 * Funcionalidad: Recibe la respuesta de Discord OAuth y vincula la cuenta
 */
import { NextRequest, NextResponse } from "next/server"
import { linkDiscord } from "@/lib/auth/linkDiscord"
import { crearNotificacion } from "@/lib/notifications/notificationService"
import { enviarDiscordVinculado } from "@/lib/email/emailService"
import { createClient } from "@supabase/supabase-js"

export async function GET(req: NextRequest) {

  const { searchParams } = new URL(req.url)
  const code  = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  // 1. Usuario canceló en Discord
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
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id:     process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type:    "authorization_code",
        code,
        redirect_uri:  `${process.env.NEXTAUTH_URL}api/vincular/discord/oauth-respuesta`,
      }),
    })

    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/perfil?seccion=redes-vinculadas&error=token`)
    }

    // 4. Obtener datos del usuario en Discord
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    const discordUser = await userRes.json()

    if (!discordUser.id) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/perfil?seccion=redes-vinculadas&error=usuario`)
    }

    // 5. Llamar a linkDiscord con los datos obtenidos
    const resultado = await linkDiscord(id_usuario, {
      providerAccountId: discordUser.id,
    })

    if (!resultado.ok) {
      const errorMsg = encodeURIComponent(resultado.error ?? "error")
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/perfil?seccion=redes-vinculadas&error=${errorMsg}`)
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

    if (usuario) {
      await enviarDiscordVinculado(usuario.email, usuario.nombres)
      await crearNotificacion({
        id_usuario,
        titulo: " Discord vinculado",
        mensaje: "Tu cuenta ha sido vinculada exitosamente con Discord.",
        id_categoria: 5,
      })
    }

    // 6. Todo ok → redirigir de vuelta al perfil
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/perfil?seccion=redes-vinculadas&success=discord`)

  } catch (err) {
    console.error("Error en oauth-respuesta Discord:", err)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/perfil?seccion=redes-vinculadas&error=servidor`)
  }
}