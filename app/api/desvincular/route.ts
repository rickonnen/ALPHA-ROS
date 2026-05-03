/** Archivo: route.ts
 * Dirección: alpha-ros-deploy1\app\api\desvincular\route.ts
 * Funcionalidad: Desvincula una red social de la cuenta del usuario
 */
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/nextAuthOptions"
import { NextRequest, NextResponse } from "next/server"
import { dbInstance } from "@/lib/auth/dbInstance"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  // 1. Verificar que hay sesión activa
  //const session = await getServerSession()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    )
  }

  const { proveedor } = await req.json()

  if (!proveedor) {
    return NextResponse.json(
      { error: "Proveedor requerido" },
      { status: 400 }
    )
  }

  const id_usuario = session.user.id

  try {
    // 2. Validación crítica → nunca desvincular el primary_provider
    const { data: usuario } = await dbInstance
      .from("Usuario")
      .select("primary_provider")
      .eq("id_usuario", id_usuario)
      .maybeSingle()

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    if (usuario.primary_provider === proveedor) {
      return NextResponse.json(
        { error: "No puedes desvincular tu método de acceso principal" },
        { status: 403 }
      )
    }

    // 3. Verificar que la red está vinculada
    const { data: red } = await dbInstance
      .from("RedesVinculadas")
      .select("id_redv")
      .eq("id_usuario", id_usuario)
      .eq("proveedor", proveedor)
      .eq("estado", true)
      .maybeSingle()

    if (!red) {
      return NextResponse.json(
        { error: "La red no está vinculada" },
        { status: 404 }
      )
    }

    // 4. UPDATE estado = false
    const { error } = await dbInstance
      .from("RedesVinculadas")
      .update({ estado: false })
      .eq("id_redv", red.id_redv)

    if (error) {
      console.error("Error desvinculando:", error)
      return NextResponse.json(
        { error: "Error al desvincular" },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })

  } catch (err) {
    console.error("Error en desvincular:", err)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
