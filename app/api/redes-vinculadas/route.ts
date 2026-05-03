/** Archivo: route.ts
 * Dirección: alpha-ros-deploy1\app\api\redes-vinculadas\route.ts
 * Funcionalidad: Retorna las redes vinculadas del usuario con su primary_provider
 */
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

import { authOptions } from "@/lib/auth/nextAuthOptions";
import { dbInstance } from "@/lib/auth/dbInstance";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  let id_usuario: string | null = session?.user?.id ?? null;

  if (!id_usuario) {
    const token = request.cookies.get("auth_token")?.value;
    if (token) {
      try {
        const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
        id_usuario = decoded.userId;
      } catch {
        // Token inválido o expirado.
      }
    }
  }

  if (!id_usuario) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { data: usuario } = await dbInstance
      .from("Usuario")
      .select("primary_provider, email, google_id")
      .eq("id_usuario", id_usuario)
      .maybeSingle();

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const { data: redes, error } = await dbInstance
      .from("RedesVinculadas")
      .select("proveedor, id_proveedor, estado")
      .eq("id_usuario", id_usuario);

    if (error) {
      console.error("Error obteniendo redes:", error);
      return NextResponse.json({ error: "Error al obtener redes" }, { status: 500 });
    }

    const proveedores = ["google", "discord", "facebook"];
    const primaryProvider = usuario.primary_provider ?? "credentials";

    const resultado = proveedores.map((proveedor) => {
      const red = redes?.find((item) => item.proveedor === proveedor);
      const esGoogle = proveedor === "google";

      return {
        proveedor,
        cuenta: esGoogle ? (usuario.google_id ? usuario.email : null) : red?.id_proveedor ?? null,
        vinculada: esGoogle ? !!usuario.google_id : red?.estado === true,
        puedeDesvincular: esGoogle
          ? false
          : (primaryProvider !== "credentials" || !!usuario.google_id) &&
            proveedor !== primaryProvider,
      };
    });

    return NextResponse.json({
      primary_provider: usuario.primary_provider,
      redes: resultado,
    });
  } catch (err) {
    console.error("Error en redes-vinculadas:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
