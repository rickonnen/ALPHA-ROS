/** Archivo: facebookAuth.ts
 * Dirección: alpha-ros-deploy1\lib\auth\facebookAuth.ts
 * Funcionalidad: SOLO maneja el login con Facebook (Sign In)
 * NO maneja vinculación desde perfil → eso es linkFacebook.ts
 */
import { dbInstance } from "./dbInstance"

export async function handleFacebookSignIn(user: any, account: any) {

  // 1. ¿Ya existe este facebook_id en Redes_vinculadas?
  const { data: redExistente } = await dbInstance
    .from("RedesVinculadas")
    .select("id_usuario")
    .eq("proveedor", "facebook")
    .eq("id_proveedor", account.providerAccountId)
    .eq("estado", true)
    .maybeSingle()

  if (redExistente) return true // Ya existe → solo iniciar sesión

  // 2. ¿Ya existe un usuario con ese email?
  const { data: usuarioExistente } = await dbInstance
    .from("Usuario")
    .select("id_usuario")
    .eq("email", user.email)
    .maybeSingle()

  if (usuarioExistente) {
    // Ya tiene cuenta con otro método → solo vinculamos Facebook
    const { error } = await dbInstance.from("RedesVinculadas").insert({
      id_usuario: usuarioExistente.id_usuario,
      proveedor: "facebook",
      id_proveedor: account.providerAccountId,
      estado: true,
    })
    if (error) {
      console.error("Error vinculando Facebook a usuario existente:", error)
      return false
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
    console.error("Error creando usuario Facebook:", authError)
    return false
  }

  // 4. Insertar en tabla Usuario con primary_provider = facebook
  const { error: dbError } = await dbInstance.from("Usuario").upsert({
    id_usuario: authData.user.id,
    email: user.email,
    nombres: user.name?.split(" ")[0] ?? "",
    apellidos: user.name?.split(" ").slice(1).join(" ") ?? "",
    url_foto_perfil: user.image ?? null,
    primary_provider: "facebook",
    rol: 2,
    estado: 1,
  }, { onConflict: "id_usuario" })

  if (dbError) {
    console.error("Error insertando usuario Facebook:", dbError)
    await dbInstance.auth.admin.deleteUser(authData.user.id)
    return false
  }

  // 5. Registrar en Redes_vinculadas
  const { error: redError } = await dbInstance.from("RedesVinculadas").insert({
    id_usuario: authData.user.id,
    proveedor: "facebook",
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