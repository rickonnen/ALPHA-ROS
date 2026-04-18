'use server'

import { prisma }        from '@/lib/prisma'
import { publicacionSchema, TIPO_INMUEBLE_IDS, TIPO_OPERACION_IDS, DEPARTAMENTO_CIUDAD, MONEDA_IDS } from './schema'
import { subirImagen }   from './cloudinary'
import { SK }            from './sessionKeys'

// Tipo de respuesta
type ActionResult =
  | { success: true;  idPublicacion: number }
  | { success: false; errors: Record<string, string[]>; reason?: string }

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

  //2. Armar payload
  const rawIdUsuario = (formData.get('id_usuario') as string) || null

  const payload = {
    // Paso 0
    titulo:         formData.get('titulo')        as string,
    tipoOperacion:  formData.get('tipoOperacion') as string,
    precio:         parseFloat(formData.get('precio') as string),
    tipoMoneda:     (formData.get('tipoMoneda') ?? 'USD') as 'USD' | 'Bs',

    // Paso 1
    tipoInmueble:       formData.get('tipoInmueble')                       as string,
    estadoConstruccion: parseInt(formData.get('estadoConstruccion') as string, 10),

    // Paso 2
    direccion:    formData.get('direccion')    as string,
    departamento: formData.get('departamento') as string,
    zona:         formData.get('zona')         as string,
    lat:  formData.get('lat')  ? parseFloat(formData.get('lat')  as string) : undefined,
    lng:  formData.get('lng')  ? parseFloat(formData.get('lng')  as string) : undefined,

    // Paso 3
    habitaciones: parseInt(formData.get('habitaciones') as string, 10),
    banios:       parseInt(formData.get('banios')       as string, 10),
    garajes:      parseInt(formData.get('garajes')      as string, 10),
    plantas:      parseInt(formData.get('plantas')      as string, 10),
    superficie:   parseFloat((formData.get('superficie') as string).replace(/\./g, '')),

    // Paso 4
    imagenesUrl,

    // Paso 5
    videoUrl: (formData.get('videoUrl') as string) || null,

    // Paso 6
    descripcion: formData.get('descripcion') as string,

    // Usuario — null mientras no haya login
    id_usuario: rawIdUsuario,
  }

  //3. Validar con Zod
  const parsed = publicacionSchema.safeParse(payload)
  if (!parsed.success) {
    return {
      success: false,
      errors:  parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const d = parsed.data

  // 4. Verificación de límite — desactivada mientras no hay login ──
  // Descomentar cuando el login esté integrado:
  //
  // const usuario = await prisma.usuario.findUnique({
  //   where:  { id_usuario: d.id_usuario! },
  //   select: { cant_publicaciones_restantes: true },
  // })
  // if (!usuario || (usuario.cant_publicaciones_restantes ?? 0) <= 0) {
  //   return { success: false, errors: {}, reason: 'LIMITE_ALCANZADO' }
  // }

  // 5. Insertar en BD (transacción atómica)
  try {
    const idCiudad  = DEPARTAMENTO_CIUDAD[d.departamento]
    const idMoneda  = MONEDA_IDS[d.tipoMoneda]
    const idTipoInm = TIPO_INMUEBLE_IDS[d.tipoInmueble]
    const idTipoOp  = TIPO_OPERACION_IDS[d.tipoOperacion]

    const resultado = await prisma.$transaction(async (tx) => {

      // 5a. Ubicacion
      const ubicacion = await tx.ubicacion.create({
        data: {
          direccion: d.direccion,
          zona:      d.zona,
          latitud:   d.lat  ?? null,
          longitud:  d.lng  ?? null,
          id_ciudad: idCiudad,
          id_pais:   1,
        },
      })

      // 5b. Publicacion — con o sin id_usuario
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

      // 5c. Imagenes
      for (const url of d.imagenesUrl) {
        await tx.$executeRaw`
          INSERT INTO "Imagen" (id_publicacion, url_imagen)
          VALUES (${pub.id_publicacion}, ${url})
        `
      }

      // 5d. Video (opcional)
      if (d.videoUrl) {
        await tx.$executeRaw`
          INSERT INTO "Video" (id_publicacion, url_video)
          VALUES (${pub.id_publicacion}, ${d.videoUrl})
        `
      }

      // 5e. Descontar publicación al usuario — desactivado mientras no hay login
      // Descomentar cuando el login esté integrado:
      //
      // await tx.$executeRaw`
      //   UPDATE "Usuario"
      //   SET cant_publicaciones_restantes = cant_publicaciones_restantes - 1,
      //       publicaciones_hechas         = publicaciones_hechas + 1
      //   WHERE id_usuario = ${d.id_usuario}::uuid
      // `

      return pub
    })

    return { success: true, idPublicacion: resultado.id_publicacion }

  } catch (err) {
    console.error('[publicarInmueble] Error BD:', err)
    return { success: false, errors: { general: ['Error al guardar. Intenta de nuevo.'] } }
  }
}