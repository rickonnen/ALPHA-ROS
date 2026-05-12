'use server'

import { cookies } from 'next/headers'
import { verify }  from 'jsonwebtoken'
import { getServerSession } from 'next-auth'
import { prisma }      from '@/lib/prisma'
import { v2 as cloudinary } from 'cloudinary'
import { publicacionSchema, TIPO_INMUEBLE_IDS, TIPO_OPERACION_IDS, DEPARTAMENTO_CIUDAD, MONEDA_IDS } from '../BackendFormulario/schema'
import { subirImagen } from '../BackendFormulario/cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key:    process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
})

async function getUserIdSeguro(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (token) {
      const decoded = verify(token, process.env.JWT_SECRET!) as { userId?: string; id?: string; sub?: string }
      const id = decoded.userId || decoded.id || decoded.sub;
      if (id) return id;
    }
  } catch (error) {
    console.error("Error JWT:", error);
  }

  const session = await getServerSession();
  
  if (session?.user?.email) {
    try {
      const usuarioBd = await prisma.usuario.findFirst({
        where: { email: session.user.email as string },
        select: { id_usuario: true }
      });
      if (usuarioBd) return usuarioBd.id_usuario;
    } catch (error) {
      console.error("Error buscando usuario por email:", error);
    }
  }

  return null;
}

// ✅ NUEVO: helper que convierte 'null' | '' | undefined | número en number | null
function parseIntNullable(raw: FormDataEntryValue | null): number | null {
  if (!raw || raw === 'null' || raw === '') return null
  const n = parseInt(raw as string, 10)
  return isNaN(n) ? null : n
}

function extraerPublicId(url: string): string | null {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

async function borrarDeCloudinary(urls: string[]) {
  const publicIds = urls.map(extraerPublicId).filter(Boolean) as string[]
  if (!publicIds.length) return
  await Promise.allSettled(
    publicIds.map(id => cloudinary.uploader.destroy(id))
  )
}

type ActionResult =
  | { success: true;  idPublicacion: number }
  | { success: false; errors: Record<string, string[]> }

export async function actualizarPublicacion(
  idPublicacion: number,
  formData: FormData,
): Promise<ActionResult> {

  const files           = formData.getAll('imagenes')        as File[]
  const imagenesViejas  = formData.getAll('imagenesViejas')  as string[]
  const imagenesABorrar = formData.getAll('imagenesABorrar') as string[]

  let imagenesNuevasUrl: string[] = []
  if (files.length > 0 && files[0].size > 0) {
    try {
      imagenesNuevasUrl = await Promise.all(files.map(f => subirImagen(f)))
    } catch (err) {
      console.error('[actualizarPublicacion] Cloudinary upload:', err)
      return { success: false, errors: { imagenes: ['Error al subir imágenes.'] } }
    }
  }

  const imagenesUrl = [...imagenesViejas, ...imagenesNuevasUrl]

  if (!imagenesUrl.length) {
    return { success: false, errors: { imagenes: ['Debes tener al menos 1 imagen.'] } }
  }

  let caracteristicasExtras: { id_caracteristica: number; detalle?: string | null }[] = []
  try {
    const rawCaract = formData.get('caracteristicasExtras') as string
    if (rawCaract) {
      caracteristicasExtras = JSON.parse(rawCaract)
    }
  } catch {
    caracteristicasExtras = []
  }

  const rawIdUsuario = await getUserIdSeguro()

  // 1. Validamos que el usuario esté logueado
  if (!rawIdUsuario) {
    return { success: false, errors: { general: ['Debes iniciar sesión para editar esta publicación.'] } }
  }

  // 2. Buscamos al dueño original de la publicación en la Base de Datos
  const publicacionOriginal = await prisma.publicacion.findUnique({
    where: { id_publicacion: idPublicacion },
    select: { id_usuario: true }
  });

  if (!publicacionOriginal) {
    return { success: false, errors: { general: ['La publicación que intentas editar no existe.'] } }
  }

  // 3. CAPA DE SEGURIDAD (IDOR): Comparamos si el que edita es el dueño
  if (String(publicacionOriginal.id_usuario) !== String(rawIdUsuario)) {
    return { success: false, errors: { general: ['ACCESO DENEGADO: No tienes permiso para editar un inmueble que no es tuyo.'] } }
  }

  const payload = {
    titulo:             formData.get('titulo')             as string,
    tipoOperacion:      formData.get('tipoOperacion')      as string,
    precio:             parseFloat(formData.get('precio')  as string),
    tipoMoneda:         (formData.get('tipoMoneda') ?? 'USD') as 'USD' | 'Bs',
    tipoInmueble:       formData.get('tipoInmueble')       as string,
    estadoConstruccion: parseInt(formData.get('estadoConstruccion') as string, 10),
    direccion:          formData.get('direccion')          as string,
    departamento:       formData.get('departamento')       as string,
    zona:               formData.get('zona')               as string,
    lat:  formData.get('lat')  ? parseFloat(formData.get('lat')  as string) : undefined,
    lng:  formData.get('lng')  ? parseFloat(formData.get('lng')  as string) : undefined,
    //  Cambiado: parseInt → parseIntNullable para soportar Terrenos (valores null)
    habitaciones: parseIntNullable(formData.get('habitaciones')),
    banios:       parseIntNullable(formData.get('banios')),
    garajes:      parseIntNullable(formData.get('garajes')),
    plantas:      parseIntNullable(formData.get('plantas')),
    superficie:   parseFloat((formData.get('superficie') as string).replace(/\./g, '')),
    imagenesUrl,
    videoUrl:    (formData.get('videoUrl')    as string) || null,
    descripcion:  formData.get('descripcion') as string,
    caracteristicasExtras,
    id_usuario:  rawIdUsuario,
  }

  const parsed = publicacionSchema.safeParse(payload)
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const d = parsed.data

  try {
    const idCiudad  = DEPARTAMENTO_CIUDAD[d.departamento]
    const idMoneda  = MONEDA_IDS[d.tipoMoneda]
    const idTipoInm = TIPO_INMUEBLE_IDS[d.tipoInmueble]
    const idTipoOp  = TIPO_OPERACION_IDS[d.tipoOperacion]

    await prisma.$transaction(async (tx) => {

      const pub = await tx.publicacion.findUnique({
        where:  { id_publicacion: idPublicacion },
        select: { id_ubicacion: true },
      })

      if (pub?.id_ubicacion) {
        await tx.ubicacion.update({
          where: { id_ubicacion: pub.id_ubicacion },
          data: {
            direccion: d.direccion,
            zona:      d.zona,
            latitud:   d.lat  ?? null,
            longitud:  d.lng  ?? null,
            id_ciudad: idCiudad,
          },
        })
      }

      await tx.$executeRaw`
        UPDATE "Publicacion" SET
          titulo                 = ${d.titulo},
          descripcion            = ${d.descripcion},
          precio                 = ${d.precio},
          superficie             = ${d.superficie},
          habitaciones           = ${d.habitaciones},
          banos                  = ${d.banios},
          garajes                = ${d.garajes},
          plantas                = ${d.plantas},
          id_tipo_inmueble       = ${idTipoInm},
          id_tipo_operacion      = ${idTipoOp},
          id_estado_construccion = ${d.estadoConstruccion},
          id_moneda              = ${idMoneda}
        WHERE id_publicacion = ${idPublicacion}
      `

      await tx.$executeRaw`DELETE FROM "Imagen" WHERE id_publicacion = ${idPublicacion}`
      for (const url of d.imagenesUrl) {
        await tx.$executeRaw`
          INSERT INTO "Imagen" (id_publicacion, url_imagen)
          VALUES (${idPublicacion}, ${url})
        `
      }

      await tx.$executeRaw`DELETE FROM "Video" WHERE id_publicacion = ${idPublicacion}`
      if (d.videoUrl) {
        await tx.$executeRaw`
          INSERT INTO "Video" (id_publicacion, url_video)
          VALUES (${idPublicacion}, ${d.videoUrl})
        `
      }

      await tx.$executeRaw`
        DELETE FROM "PublicacionCaracteristica" WHERE id_publicacion = ${idPublicacion}
      `
      if (d.caracteristicasExtras && d.caracteristicasExtras.length > 0) {
        for (const caract of d.caracteristicasExtras) {
          await tx.$executeRaw`
            INSERT INTO "PublicacionCaracteristica" (id_publicacion, id_caracteristica, detalle_caracteristica)
            VALUES (${idPublicacion}, ${caract.id_caracteristica}, ${caract.detalle ?? null})
          `
        }
      }
    })

    if (imagenesABorrar.length > 0) {
      await borrarDeCloudinary(imagenesABorrar)
    }

    return { success: true, idPublicacion }
  } catch (err) {
    console.error('[actualizarPublicacion]', err)
    return { success: false, errors: { general: ['Error al guardar. Intenta de nuevo.'] } }
  }
}