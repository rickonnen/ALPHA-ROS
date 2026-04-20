'use server'

import { cookies } from 'next/headers'
import { verify }  from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { publicacionSchema, TIPO_INMUEBLE_IDS, TIPO_OPERACION_IDS, DEPARTAMENTO_CIUDAD, MONEDA_IDS } from './schema'
import { subirImagen } from './cloudinary'
import { SK } from './sessionKeys'

// Tipo de respuesta
type ActionResult =
  | { success: true; idPublicacion: number }
  | { success: false; errors: Record<string, string[]>; reason?: string }

// Helper: lee el id_usuario desde la cookie auth_token (JWT)
async function getUserIdFromCookie(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return null
    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string }
    return decoded.userId ?? null
  } catch {
    return null
  }
}

// Helper: convierte 'null' | '' | undefined | número en number | null
function parseIntNullable(raw: FormDataEntryValue | null): number | null {
  if (!raw || raw === 'null' || raw === '') return null
  const n = parseInt(raw as string, 10)
  return isNaN(n) ? null : n
}

// Action principal
export async function publicarInmueble(formData: FormData): Promise<ActionResult> {

  // 1. Subir imágenes a Cloudinary
  const files = formData.getAll('imagenes') as File[]
  if (!files.length) {
    return { success: false, errors: { imagenes: ['Debes subir al menos 1 imagen.'] } }
  }

  let imagenesUrl: string[]
  try {
    imagenesUrl = await Promise.all(files.map(f => subirImagen(f)))
  } catch (err) {
    console.error('[publicarInmueble] Error Cloudinary:', err)
    return { success: false, errors: { imagenes: ['Error al subir imágenes. Intenta de nuevo.'] } }
  }

  // 2. Parsear características extras desde FormData
  let caracteristicasExtras: { id_caracteristica: number; detalle?: string | null }[] = []
  try {
    const rawCaract = formData.get('caracteristicasExtras') as string
    if (rawCaract) {
      caracteristicasExtras = JSON.parse(rawCaract)
    }
  } catch {
    caracteristicasExtras = []
  }

  // 3. Armar payload — id_usuario se lee desde la cookie JWT, no del FormData
  const rawIdUsuario = await getUserIdFromCookie()

  const payload = {
    // Paso 0
    titulo: formData.get('titulo') as string,
    tipoOperacion: formData.get('tipoOperacion') as string,
    precio: parseFloat(formData.get('precio') as string),
    tipoMoneda: (formData.get('tipoMoneda') ?? 'USD') as 'USD' | 'Bs',

    // Paso 1
    tipoInmueble: formData.get('tipoInmueble') as string,
    estadoConstruccion: parseInt(formData.get('estadoConstruccion') as string, 10),

    // Paso 2
    direccion: formData.get('direccion') as string,
    departamento: formData.get('departamento') as string,
    zona: formData.get('zona') as string,
    lat: formData.get('lat') ? parseFloat(formData.get('lat') as string) : undefined,
    lng: formData.get('lng') ? parseFloat(formData.get('lng') as string) : undefined,

    // Paso 3 — nullable: Terreno → null, campo vacío → null, número → number
    habitaciones: parseIntNullable(formData.get('habitaciones')),
    banios: parseIntNullable(formData.get('banios')),
    garajes: parseIntNullable(formData.get('garajes')),
    plantas: parseIntNullable(formData.get('plantas')),
    superficie: parseFloat((formData.get('superficie') as string).replace(/\./g, '')),

    // Paso 4
    imagenesUrl,

    // Paso 5
    videoUrl: (formData.get('videoUrl') as string) || null,

    // Paso 6
    descripcion: formData.get('descripcion') as string,

    // Paso 6 — Características Extras
    caracteristicasExtras,

    // Usuario — leído desde cookie JWT
    id_usuario: rawIdUsuario,
  }

  // 4. Validar con Zod
  const parsed = publicacionSchema.safeParse(payload)
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const d = parsed.data

  // 5. Verificación de límite de publicaciones
  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario: d.id_usuario! },
    select: { cant_publicaciones_restantes: true },
  })
  if (!usuario || (usuario.cant_publicaciones_restantes ?? 0) <= 0) {
    return { success: false, errors: {}, reason: 'LIMITE_ALCANZADO' }
  }

  // 6. Insertar en BD (transacción atómica)
  try {
    const idCiudad  = DEPARTAMENTO_CIUDAD[d.departamento]
    const idMoneda  = MONEDA_IDS[d.tipoMoneda]
    const idTipoInm = TIPO_INMUEBLE_IDS[d.tipoInmueble]
    const idTipoOp  = TIPO_OPERACION_IDS[d.tipoOperacion]

    const resultado = await prisma.$transaction(async (tx) => {

      // 6a. Ubicacion
      const ubicacion = await tx.ubicacion.create({
        data: {
          direccion: d.direccion,
          zona: d.zona,
          latitud: d.lat ?? null,
          longitud: d.lng ?? null,
          id_ciudad: idCiudad,
          id_pais: 1,
        },
      })

      // 6b. Publicacion — con o sin id_usuario
      const [pub] = d.id_usuario
        ? await tx.$queryRaw<{ id_publicacion: number }[]>`
            INSERT INTO "Publicacion" (
              titulo, descripcion, precio, superficie,
              habitaciones, banos, garajes, plantas,
              id_tipo_inmueble, id_tipo_operacion,
              id_estado_construccion,
              id_ubicacion, id_moneda, id_usuario
            ) VALUES (
              ${d.titulo},
              ${d.descripcion},
              ${d.precio},
              ${d.superficie},
              ${d.habitaciones},
              ${d.banios},
              ${d.garajes},
              ${d.plantas},
              ${idTipoInm},
              ${idTipoOp},
              ${d.estadoConstruccion},
              ${ubicacion.id_ubicacion},
              ${idMoneda},
              ${d.id_usuario}::uuid
            )
            RETURNING id_publicacion
          `
        : await tx.$queryRaw<{ id_publicacion: number }[]>`
            INSERT INTO "Publicacion" (
              titulo, descripcion, precio, superficie,
              habitaciones, banos, garajes, plantas,
              id_tipo_inmueble, id_tipo_operacion,
              id_estado_construccion,
              id_ubicacion, id_moneda
            ) VALUES (
              ${d.titulo},
              ${d.descripcion},
              ${d.precio},
              ${d.superficie},
              ${d.habitaciones},
              ${d.banios},
              ${d.garajes},
              ${d.plantas},
              ${idTipoInm},
              ${idTipoOp},
              ${d.estadoConstruccion},
              ${ubicacion.id_ubicacion},
              ${idMoneda}
            )
            RETURNING id_publicacion
          `

      // 6c. Imagenes
      for (const url of d.imagenesUrl) {
        await tx.$executeRaw`
          INSERT INTO "Imagen" (id_publicacion, url_imagen)
          VALUES (${pub.id_publicacion}, ${url})
        `
      }

      // 6d. Video (opcional)
      if (d.videoUrl) {
        await tx.$executeRaw`
          INSERT INTO "Video" (id_publicacion, url_video)
          VALUES (${pub.id_publicacion}, ${d.videoUrl})
        `
      }

      // 6e. Características Extras (PublicacionCaracteristica)
      if (d.caracteristicasExtras && d.caracteristicasExtras.length > 0) {
        for (const caract of d.caracteristicasExtras) {
          await tx.$executeRaw`
            INSERT INTO "PublicacionCaracteristica" (id_publicacion, id_caracteristica, detalle_caracteristica)
            VALUES (${pub.id_publicacion}, ${caract.id_caracteristica}, ${caract.detalle ?? null})
          `
        }
      }

      // 6f. El descuento de publicaciones restantes y el incremento de
      //     publicaciones_hechas lo maneja un trigger en la base de datos.

      return pub
    })

    return { success: true, idPublicacion: resultado.id_publicacion }

  } catch (err) {
    console.error('[publicarInmueble] Error BD:', err)
    return { success: false, errors: { general: ['Error al guardar. Intenta de nuevo.'] } }
  }
}