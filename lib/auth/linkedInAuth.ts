/** Archivo: linkedInAuth.ts
 * Direccion: alpha-ros-deploy1\lib\auth\linkedInAuth.ts
 */
import { dbInstance } from "./dbInstance"

export async function handleLinkedInSignIn(user: any, account: any) {
  // 1. Ya existe este linkedin_id en RedesVinculadas?
  const { data: redExistente } = await dbInstance
    .from("RedesVinculadas")
    .select("id_usuario, estado")
    .eq("proveedor", "linkedin")
    .eq("id_proveedor", account.providerAccountId)
    .maybeSingle()

  if (redExistente) {
    if (redExistente.estado === true) return true
    if (redExistente.estado === false) {
      return "/auth/linkedIn-desvinculado"
    }
  }

  // 2. Ya existe un usuario con ese email?
  const { data: usuarioExistente } = await dbInstance
    .from("Usuario")
    .select("id_usuario")
    .eq("email", user.email)
    .maybeSingle()

  if (usuarioExistente) {
    const { data: redUsuario } = await dbInstance
      .from("RedesVinculadas")
      .select("id_redv, estado")
      .eq("id_usuario", usuarioExistente.id_usuario)
      .eq("proveedor", "linkedin")
      .maybeSingle()

    if (redUsuario?.estado === false) {
      const { error } = await dbInstance
        .from("RedesVinculadas")
        .update({ estado: true, id_proveedor: account.providerAccountId })
        .eq("id_redv", redUsuario.id_redv)

      if (error) {
        console.error("Error revinculando LinkedIn:", error)
        return false
      }
    } else if (!redUsuario) {
      const { error } = await dbInstance.from("RedesVinculadas").insert({
        id_usuario: usuarioExistente.id_usuario,
        proveedor: "linkedin",
        id_proveedor: account.providerAccountId,
        estado: true,
      })

      if (error) {
        console.error("Error vinculando LinkedIn a usuario existente:", error)
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
    console.error("Error creando usuario LinkedIn:", authError)
    return false
  }

  // 4. Insertar en tabla Usuario con primary_provider = linkedin
  const { error: dbError } = await dbInstance.from("Usuario").upsert({
    id_usuario: authData.user.id,
    email: user.email,
    nombres: user.name?.split(" ")[0] ?? "",
    apellidos: user.name?.split(" ").slice(1).join(" ") ?? "",
    url_foto_perfil: user.image ?? null,
    primary_provider: "linkedin",
    rol: 2,
    estado: 1,
  }, { onConflict: "id_usuario" })

  if (dbError) {
    console.error("Error insertando usuario LinkedIn:", dbError)
    await dbInstance.auth.admin.deleteUser(authData.user.id)
    return false
  }

  // 5. Registrar en RedesVinculadas
  const { error: redError } = await dbInstance.from("RedesVinculadas").insert({
    id_usuario: authData.user.id,
    proveedor: "linkedin",
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