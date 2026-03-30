'use server'

import { prisma }                                     from '@/lib/prisma'
import { caracteristicasSchema, DEPARTAMENTO_CIUDAD } from './schema'
import type { CaracteristicasInput }                  from './schema'
import { subirImagen }                                from './cloudinary'

// Mapeo de strings del paso 1 a IDs de la BD
const TIPO_INMUEBLE_IDS: Record<string, number> = {
  Casa:          1,
  Departamento:  2,
  Terreno:       3,
  Oficina:       4,
}

const TIPO_OPERACION_IDS: Record<string, number> = {
  Venta:         1,
  Alquiler:      2,
  Anticretico:   3,
}

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

  // Datos del paso 2
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

  // Datos del paso 1
  const strTitulo        = formData.get('titulo')        as string
  const strPrecio        = formData.get('precio')        as string
  const strDescripcion   = formData.get('descripcion')   as string
  const strTipoPropiedad = formData.get('tipoPropiedad') as string
  const strTipoOperacion = formData.get('tipoOperacion') as string
  // URL del video — Historia 3 (opcional)
  const strVideoUrl      = formData.get('videoUrl')      as string | null

  return guardarPublicacionCompleta(data, {
    titulo:            strTitulo,
    precio:            parseFloat(strPrecio),
    descripcion:       strDescripcion,
    id_tipo_inmueble:  TIPO_INMUEBLE_IDS[strTipoPropiedad] ?? null,
    id_tipo_operacion: TIPO_OPERACION_IDS[strTipoOperacion] ?? null,
    videoUrl:          strVideoUrl || null,
  })
}

// ─── Guarda en DB ─────────────────────────────────────────────────────────────

async function guardarPublicacionCompleta(
  data: CaracteristicasInput,
  paso1: {
    titulo:            string;
    precio:            number;
    descripcion:       string;
    id_tipo_inmueble:  number | null;
    id_tipo_operacion: number | null;
    videoUrl:          string | null;
  },
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

    // 3. Crear Publicacion con datos del paso 1 y paso 2
    const resultado = await prisma.$queryRaw<{ id_publicacion: number }[]>`
      INSERT INTO "Publicacion" (
        titulo, descripcion, precio,
        id_tipo_inmueble, id_tipo_operacion,
        superficie, habitaciones, banos, plantas, garajes,
        id_ubicacion
      )
      VALUES (
        ${paso1.titulo},
        ${paso1.descripcion},
        ${paso1.precio},
        ${paso1.id_tipo_inmueble},
        ${paso1.id_tipo_operacion},
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

    // 4. Crear Imagenes
    for (const url of imagenesUrl) {
      await prisma.$executeRaw`
        INSERT INTO "Imagen" (id_publicacion, url_imagen)
        VALUES (${idPublicacion}, ${url})
      `
    }

    // 5. Guardar URL del video si fue proporcionada — Historia 3
    if (paso1.videoUrl) {
      await prisma.$executeRaw`
        INSERT INTO "Video" (id_publicacion, url_video)
        VALUES (${idPublicacion}, ${paso1.videoUrl})
      `
    }

    return { success: true, idPublicacion: resultado[0].id_publicacion }

  } catch (err) {
    console.error('[guardarPublicacionCompleta] Error en DB:', err)
    return {
      success: false,
      errors:  { general: ['Error al guardar la publicación. Intenta de nuevo.'] },
    }
  }
}

// Mantener exportada para compatibilidad
export async function guardarCaracteristicas(
  data: CaracteristicasInput,
): Promise<ActionResult> {
  return guardarPublicacionCompleta(data, {
    titulo:            '',
    precio:            0,
    descripcion:       '',
    id_tipo_inmueble:  null,
    id_tipo_operacion: null,
    videoUrl:          null,
  })
}