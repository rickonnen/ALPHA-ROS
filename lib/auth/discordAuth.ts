/** Archivo: discordAuth.ts
 * Dirección: alpha-ros-deploy1\lib\auth\discordAuth.ts
 * Funcionalidad: SOLO maneja el login con Discord (Sign In)
 * NO maneja vinculación desde perfil → eso es linkDiscord.ts
 */
import { dbInstance } from "./dbInstance"

export async function handleDiscordSignIn(user: any, account: any) {

  // 1. ¿Ya existe este discord_id en Redes_vinculadas?
  const { data: redExistente } = await dbInstance
    .from("RedesVinculadas")
    .select("id_usuario, estado") 
   .eq("proveedor", "discord")
    .eq("id_proveedor", account.providerAccountId)
    //.eq("estado", true)
    .maybeSingle()

    if (redExistente) {
      if (redExistente.estado === true) return true // DC activo → iniciar sesión
      if (redExistente.estado === false) {           //DC desvinculado → bloquear
        return "/auth/discord-desvinculado"
      }
    }
  // 2. ¿Ya existe un usuario con ese email?
  const { data: usuarioExistente } = await dbInstance
    .from("Usuario")
    .select("id_usuario")
    .eq("email", user.email)
    .maybeSingle()

  if (usuarioExistente) {
    // Verificar si ya existe una fila con estado = false
    const { data: redExistente } = await dbInstance
      .from("RedesVinculadas")
      .select("id_redv, estado")
      .eq("id_usuario", usuarioExistente.id_usuario)
      .eq("proveedor", "discord")
      .maybeSingle()

    if (redExistente?.estado === false) {
      // UPDATE en lugar de INSERT
      const { error } = await dbInstance
        .from("RedesVinculadas")
        .update({ estado: true, id_proveedor: account.providerAccountId })
        .eq("id_redv", redExistente.id_redv)
      if (error) {
        console.error("Error revinculando Discord:", error)
        return false
      }
    } else if (!redExistente) {
      // Solo INSERT si no existe nada
      const { error } = await dbInstance.from("RedesVinculadas").insert({
        id_usuario: usuarioExistente.id_usuario,
        proveedor: "discord",
        id_proveedor: account.providerAccountId,
        estado: true,
      })
      if (error) {
        console.error("Error vinculando Discord a usuario existente:", error)
        return false
      }
    }
    return true
  }

  // 3. Usuario completamente nuevo → crear en auth.users
  const { data: authData, error: authError } = await dbInstance.auth.admin.createUser({
    email: user.email!,
    email_confirm: true,
    user_metadata: {
      nombre: user.name?.split(" ")[0] ?? "",
      apellido: user.name?.split(" ").slice(1).join(" ") ?? "",
    },
  })

  if (authError) {
    console.error("Error creando usuario Discord:", authError)
    return false
  }

  // 4. Insertar en tabla Usuario con primary_provider = discord
  const { error: dbError } = await dbInstance.from("Usuario").upsert({
    id_usuario: authData.user.id,
    email: user.email,
    nombres: user.name?.split(" ")[0] ?? "",
    apellidos: user.name?.split(" ").slice(1).join(" ") ?? "",
    url_foto_perfil: user.image ?? null,
    primary_provider: "discord",
    rol: 2,
    estado: 1,
  }, { onConflict: "id_usuario" })

  if (dbError) {
    console.error("Error insertando usuario Discord:", dbError)
    await dbInstance.auth.admin.deleteUser(authData.user.id)
    return false
  }

  // 5. Registrar en Redes_vinculadas
  const { error: redError } = await dbInstance.from("RedesVinculadas").insert({
    id_usuario: authData.user.id,
    proveedor: "discord",
    id_proveedor: account.providerAccountId,
    estado: true,
  })

  if (redError) {
    console.error("Error insertando en RedesVinculadas:", redError)
    await dbInstance.auth.admin.deleteUser(authData.user.id)
    return false
  }

  return true
}