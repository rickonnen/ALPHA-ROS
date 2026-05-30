/** Archivo: linkLinkedIn.ts
 * Direccion: alpha-ros-deploy1\lib\auth\linkLinkedIn.ts
 */
import { dbInstance } from "./dbInstance"

export async function linkLinkedIn(id_usuario: string, account: any) {
  // 1. Validar colision → este linkedin_id ya esta en otro usuario?
  const { data: colision } = await dbInstance
    .from("RedesVinculadas")
    .select("id_usuario")
    .eq("proveedor", "linkedin")
    .eq("id_proveedor", account.providerAccountId)
    .eq("estado", true)
    .neq("id_usuario", id_usuario)
    .maybeSingle()

  if (colision) {
    return {
      ok: false,
      error: "Esta cuenta de LinkedIn ya esta asociada a otro usuario.",
    }
  }

  // 2. Ya tiene esta red vinculada con estado = true?
  const { data: yaVinculada } = await dbInstance
    .from("RedesVinculadas")
    .select("id_redv, estado")
    .eq("id_usuario", id_usuario)
    .eq("proveedor", "linkedin")
    .maybeSingle()

  if (yaVinculada?.estado === true) {
    return {
      ok: false,
      error: "LinkedIn ya esta vinculado a tu cuenta.",
    }
  }

  // 3. Ya existio antes pero fue desvinculada (estado = false)? → UPDATE
  if (yaVinculada?.estado === false) {
    const { error } = await dbInstance
      .from("RedesVinculadas")
      .update({
        estado: true,
        id_proveedor: account.providerAccountId,
      })
      .eq("id_redv", yaVinculada.id_redv)

    if (error) {
      console.error("Error revinculando LinkedIn:", error)
      return { ok: false, error: "Error al revincular LinkedIn." }
    }

    return { ok: true }
  }

  // 4. Primera vez → INSERT
  const { error } = await dbInstance.from("RedesVinculadas").insert({
    id_usuario,
    proveedor: "linkedin",
    id_proveedor: account.providerAccountId,
    estado: true,
  })

  if (error) {
    console.error("Error vinculando LinkedIn:", error)
    return { ok: false, error: "Error al vincular LinkedIn." }
  }

  return { ok: true }
}