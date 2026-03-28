'use server'

import { prisma }                                     from '@/lib/prisma'
import { caracteristicasSchema, DEPARTAMENTO_CIUDAD } from './schema'
import type { CaracteristicasInput }                  from './schema'
import { subirImagen }                                from './cloudinary'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type ActionResult =
  | { success: true;  idPublicacion: number }
  | { success: false; errors: Record<string, string[]> }

// ─── Acción principal ─────────────────────────────────────────────────────────

export async function publicarConImagenes(
  formData: FormData,
): Promise<ActionResult> {

  const files = formData.getAll('imagenes') as File[]

  if (!files.length) {
    return {
      success: false,
      errors:  { imagenes: ['Debes subir al menos 1 imagen.'] },
    }
  }

  let imagenesUrl: string[]
  try {
    imagenesUrl = await Promise.all(files.map((file) => subirImagen(file)))
  } catch (err) {
    console.error('[publicarConImagenes] Error en Cloudinary:', err)
    return {
      success: false,
      errors:  { imagenes: ['Error al subir las imágenes. Intenta de nuevo.'] },
    }
  }

  const data: CaracteristicasInput = {
    direccion:    formData.get('direccion')    as string,
    superficie:   parseFloat(formData.get('superficie') as string),
    departamento: formData.get('departamento') as CaracteristicasInput['departamento'],
    zona:         formData.get('zona')         as string,
    habitaciones: parseInt(formData.get('habitaciones') as string, 10),
    banios:       parseInt(formData.get('banios')       as string, 10),
    plantas:      parseInt(formData.get('plantas')      as string, 10),
    garajes:      parseInt(formData.get('garajes')      as string, 10),
    imagenesUrl,
  }

  return guardarCaracteristicas(data)
}

// ─── Guarda en DB ─────────────────────────────────────────────────────────────

export async function guardarCaracteristicas(
  data: CaracteristicasInput,
): Promise<ActionResult> {

  const parsed = caracteristicasSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      errors:  parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const {
    direccion,
    superficie,
    departamento,
    zona,
    habitaciones,
    banios,
    plantas,
    garajes,
    imagenesUrl,
  } = parsed.data

  const idCiudad = DEPARTAMENTO_CIUDAD[departamento]

  try {
    // 1. Obtener próximo id_ubicacion
    const ultimaUbicacion = await prisma.ubicacion.findFirst({
      orderBy: { id_ubicacion: 'desc' },
      select:  { id_ubicacion: true },
    })
    const nextIdUbicacion = (ultimaUbicacion?.id_ubicacion ?? 0) + 1

    // 2. Crear Ubicacion
    await prisma.ubicacion.create({
      data: {
        id_ubicacion: nextIdUbicacion,
        direccion,
        zona,
        id_ciudad:    idCiudad,
      },
    })

    // 3. Crear Publicacion con SQL raw (GENERATED ALWAYS)
    const resultado = await prisma.$queryRaw<{ id_publicacion: number }[]>`
      INSERT INTO "Publicacion" (superficie, habitaciones, banos, plantas, garajes, id_ubicacion)
      VALUES (
        ${parseFloat(superficie.toString())},
        ${habitaciones},
        ${banios},
        ${plantas},
        ${garajes},
        ${nextIdUbicacion}
      )
      RETURNING id_publicacion
    `
    const idPublicacion = resultado[0].id_publicacion

    // 4. Crear Imagenes con SQL raw (GENERATED ALWAYS)
    for (const url of imagenesUrl) {
      await prisma.$executeRaw`
        INSERT INTO "Imagen" (id_publicacion, url_imagen)
        VALUES (${idPublicacion}, ${url})
      `
    }

    return {
      success:       true,
      idPublicacion,
    }

  } catch (err) {
    console.error('[guardarCaracteristicas] Error en DB:', err)
    return {
      success: false,
      errors:  { general: ['Error al guardar la publicación. Intenta de nuevo.'] },
    }
  }
}