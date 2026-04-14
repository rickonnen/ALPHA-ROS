'use server'

/**
 * Dev: Gabriel Paredes Sipe
 * Date modification: 30/03/2026
 * Funcionalidad: Server action principal del paso 2 de publicación de inmuebles.
 * Recibe el FormData con los datos de ambos pasos, sube las imágenes
 * a Cloudinary, crea la Ubicacion y la Publicacion en la BD.
 * Modificación: se lee id_usuario desde el FormData (guardado en el
 * paso 1 por useInformacionComercialForm) y se vincula en el INSERT
 * de la tabla Publicacion para asociar la publicación al usuario
 * autenticado.
 * Modificación HU5 (Jimmy): Se añade la barrera atómica para descontar
 * el límite de publicaciones gratuitas y el rollback en caso de error.
 * @param {FormData} formData - Datos del formulario de ambos pasos + imágenes
 * @return {ActionResult} Objeto con success y idPublicacion o errores
 */

import { prisma } from '@/lib/prisma'
import { caracteristicasSchema, DEPARTAMENTO_CIUDAD } from './schema'
import type { CaracteristicasInput } from './schema'
import { subirImagen } from './cloudinary'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type ActionResult =
  | { success: true; idPublicacion: number }
  | { success: false; errors: Record<string, string[]>; reason?: string }

// ─── Acción principal ─────────────────────────────────────────────────────────

export async function publicarConImagenes(
  formData: FormData,
): Promise<ActionResult> {

  const files = formData.getAll('imagenes') as File[]

  if (!files.length) {
    return {
      success: false,
      errors: { imagenes: ['Debes subir al menos 1 imagen.'] },
    }
  }

  let imagenesUrl: string[]
  try {
    imagenesUrl = await Promise.all(files.map((file) => subirImagen(file)))
  } catch (err) {
    console.error('[publicarConImagenes] Error en Cloudinary:', err)
    return {
      success: false,
      errors: { imagenes: ['Error al subir las imágenes. Intenta de nuevo.'] },
    }
  }

  const data: CaracteristicasInput = {
    direccion: formData.get('direccion') as string,
    superficie: parseFloat(formData.get('superficie') as string),
    departamento: formData.get('departamento') as CaracteristicasInput['departamento'],
    zona: formData.get('zona') as string,
    habitaciones: parseInt(formData.get('habitaciones') as string, 10),
    banios: parseInt(formData.get('banios') as string, 10),
    plantas: parseInt(formData.get('plantas') as string, 10),
    garajes: parseInt(formData.get('garajes') as string, 10),
    imagenesUrl,
  }

  const strTitulo = formData.get('titulo') as string
  const strPrecio = formData.get('precio') as string
  const strDescripcion = formData.get('descripcion') as string
  const strTipoPropiedad = formData.get('tipoPropiedad') as string
  const strTipoOperacion = formData.get('tipoOperacion') as string
  const strVideoUrl = formData.get('videoUrl') as string | null

  const [tipoInmueble, tipoOperacion] = await Promise.all([
    prisma.tipoInmueble.findFirst({
      where: {
        nombre_inmueble: { equals: strTipoPropiedad, mode: 'insensitive' }
      },
      select: { id_tipo_inmueble: true }
    }),
    prisma.tipoOperacion.findFirst({
      where: {
        nombre_operacion: { equals: strTipoOperacion, mode: 'insensitive' }
      },
      select: { id_tipo_operacion: true }
    })
  ])

  if (!tipoInmueble || !tipoOperacion) {
    return {
      success: false,
      errors: {
        general: ['El tipo de propiedad o de operación seleccionado no es válido en la base de datos.']
      },
    }
  }

  const strIdUsuario = formData.get('id_usuario') as string

  return guardarPublicacionCompleta(data, {
    titulo: strTitulo,
    precio: parseFloat(strPrecio),
    descripcion: strDescripcion,
    id_tipo_inmueble: tipoInmueble.id_tipo_inmueble,
    id_tipo_operacion: tipoOperacion.id_tipo_operacion,
    videoUrl: strVideoUrl || null,
    id_usuario: strIdUsuario,
  })
}

// ─── Guarda en DB ─────────────────────────────────────────────────────────────

async function guardarPublicacionCompleta(
  data: CaracteristicasInput,
  paso1: {
    titulo: string;
    precio: number;
    descripcion: string;
    id_tipo_inmueble: number | null;
    id_tipo_operacion: number | null;
    videoUrl: string | null;
    id_usuario: string;
  },
): Promise<ActionResult> {

  const parsed = caracteristicasSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
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
    // 1. Crear Ubicacion — Prisma asigna el id_ubicacion automáticamente
    const resultadoUbicacion = await prisma.$queryRaw<{ id_ubicacion: number }[]>`
    INSERT INTO "Ubicacion" (direccion, zona, id_ciudad)
    VALUES (${direccion}, ${zona}, ${idCiudad})
    RETURNING id_ubicacion
    `
    const idUbicacion = resultadoUbicacion[0].id_ubicacion
    // 2. Crear Publicacion vinculada al usuario y a la ubicación recién creada
    const resultado = await prisma.$queryRaw<{ id_publicacion: number }[]>`
      INSERT INTO "Publicacion" (
        titulo, descripcion, precio,
        id_tipo_inmueble, id_tipo_operacion,
        superficie, habitaciones, banos, plantas, garajes,
        id_ubicacion, id_usuario
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
        ${idUbicacion},
        ${paso1.id_usuario}::uuid
      )
      RETURNING id_publicacion
    `

    const idPublicacion = resultado[0].id_publicacion

    // 3. Crear Imagenes
    for (const url of imagenesUrl) {
      await prisma.$executeRaw`
        INSERT INTO "Imagen" (id_publicacion, url_imagen)
        VALUES (${idPublicacion}, ${url})
      `
    }

    // 4. Guardar URL del video si fue proporcionada — Historia 3
    if (paso1.videoUrl) {
      await prisma.$executeRaw`
        INSERT INTO "Video" (id_publicacion, url_video)
        VALUES (${idPublicacion}, ${paso1.videoUrl})
      `
    }

    return { success: true, idPublicacion }

  } catch (err) {
    console.error('[guardarPublicacionCompleta] Error en DB:', err)
    return {
      success: false,
      errors: { general: ['Error al guardar la publicación. Intenta de nuevo.'] },
    }
  }
}

export async function guardarCaracteristicas(
  data: CaracteristicasInput,
): Promise<ActionResult> {
  return guardarPublicacionCompleta(data, {
    titulo: '',
    precio: 0,
    descripcion: '',
    id_tipo_inmueble: null,
    id_tipo_operacion: null,
    videoUrl: null,
    id_usuario: '',
  })
}