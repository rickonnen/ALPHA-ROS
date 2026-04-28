/** Archivo: route.ts
 * Dirección: alpha-ros-deploy1\app\api\redes-vinculadas\route.ts
 * Funcionalidad: Retorna las redes vinculadas del usuario con su primary_provider
 */
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route" // 

import { NextResponse } from "next/server"
import { dbInstance } from "@/lib/auth/dbInstance"

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

  const id_usuario = session.user.id

  try {
    // 2. Obtener primary_provider del usuario
    const { data: usuario } = await dbInstance
      .from("Usuario")
      .select("primary_provider, email")
      .eq("id_usuario", id_usuario)
      .maybeSingle()

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    // 3. Obtener todas las redes vinculadas del usuario
    const { data: redes, error } = await dbInstance
      .from("RedesVinculadas")
      .select("proveedor, id_proveedor, estado")
      .eq("id_usuario", id_usuario)

    if (error) {
      console.error("Error obteniendo redes:", error)
      return NextResponse.json(
        { error: "Error al obtener redes" },
        { status: 500 }
      )
    }

    // 4. Construir respuesta con los 3 proveedores siempre presentes
    const proveedores = ["google", "discord", "facebook"]

    const resultado = proveedores.map((proveedor) => {
      const red = redes?.find((r) => r.proveedor === proveedor)
      const esGoogle = proveedor === "google"

      return {
        proveedor,
        // Google muestra el email, Discord y Facebook muestran el id_proveedor
        cuenta: esGoogle
          ? usuario.email
          : red?.id_proveedor ?? null,
        vinculada: esGoogle
          ? !!usuario.email
          : red?.estado === true,
        // Si es el primary_provider → no puede desvincular
        puedeDesvincular: proveedor !== usuario.primary_provider,
      }
    })

    return NextResponse.json({
      primary_provider: usuario.primary_provider,
      redes: resultado,
    })

  } catch (err) {
    console.error("Error en redes-vinculadas:", err)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}