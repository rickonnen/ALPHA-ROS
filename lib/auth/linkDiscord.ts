/** Archivo: linkDiscord.ts
 * Dirección: alpha-ros-deploy1\lib\auth\linkDiscord.ts
 * Funcionalidad: SOLO maneja la vinculación de Discord desde perfil
 * NO maneja login → eso es discordAuth.ts
 */
import { dbInstance } from "./dbInstance"

export async function linkDiscord(id_usuario: string, account: any) {

  // 1. Validar colisión → ¿Este discord_id ya está en otro usuario?
  const { data: colision } = await dbInstance
    .from("RedesVinculadas")
    .select("id_usuario")
    .eq("proveedor", "discord")
    .eq("id_proveedor", account.providerAccountId)
    .eq("estado", true)
    .neq("id_usuario", id_usuario)
    .maybeSingle()

  if (colision) {
    return {
      ok: false,
      error: "Esta cuenta de Discord ya está asociada a otro usuario.",
    }
  }

  // 2. ¿Ya tiene esta red vinculada con estado = true?
  const { data: yaVinculada } = await dbInstance
    .from("RedesVinculadas")
    .select("id_redv, estado")
    .eq("id_usuario", id_usuario)
    .eq("proveedor", "discord")
    .maybeSingle()

  if (yaVinculada?.estado === true) {
    return {
      ok: false,
      error: "Discord ya está vinculado a tu cuenta.",
    }
  }

  // 3. ¿Ya existió antes pero fue desvinculada (estado = false)? → UPDATE
  if (yaVinculada?.estado === false) {
    const { error } = await dbInstance
      .from("RedesVinculadas")
      .update({
        estado: true,
        id_proveedor: account.providerAccountId,
      })
      .eq("id_redv", yaVinculada.id_redv)

    if (error) {
      console.error("Error revinculando Discord:", error)
      return { ok: false, error: "Error al revincular Discord." }
    }

    return { ok: true }
  }

  // 4. Primera vez → INSERT
  const { error } = await dbInstance.from("RedesVinculadas").insert({
    id_usuario,
    proveedor: "discord",
    id_proveedor: account.providerAccountId,
    estado: true,
  })

  if (error) {
    console.error("Error vinculando Discord:", error)
    return { ok: false, error: "Error al vincular Discord." }
  }

  return { ok: true }
}