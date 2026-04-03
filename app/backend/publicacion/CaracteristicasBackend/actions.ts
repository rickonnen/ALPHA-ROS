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
  Venta:       1,
  Alquiler:    2,
  Anticretico: 3,
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

type ActionResult =
  | { success: true;  idPublicacion: number }
  // Modificado HU5: Añadido "reason" para que el frontend detecte el límite alcanzado
  | { success: false; errors: Record<string, string[]>; reason?: string }

// ─── Acción principal ─────────────────────────────────────────────────────────

/**
 * Dev: Gabriel Paredes Sipe
 * Date modification: 30/03/2026
 * Funcionalidad: Orquesta la subida de imágenes a Cloudinary y el guardado
 * completo de la publicación en la BD con su usuario vinculado.
 * @param {FormData} formData - FormData con campos del paso 1, paso 2 e imágenes
 * @return {ActionResult} Resultado de la operación con idPublicacion o errores
 */
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
  const strVideoUrl      = formData.get('videoUrl')      as string | null

  // ID del usuario autenticado — viene del sessionStorage del paso 1
  const strIdUsuario = formData.get('id_usuario') as string

  return guardarPublicacionCompleta(data, {
    titulo:            strTitulo,
    precio:            parseFloat(strPrecio),
    descripcion:       strDescripcion,
    id_tipo_inmueble:  TIPO_INMUEBLE_IDS[strTipoPropiedad] ?? null,
    id_tipo_operacion: TIPO_OPERACION_IDS[strTipoOperacion] ?? null,
    videoUrl:          strVideoUrl || null,
    id_usuario:        strIdUsuario,
  })
}

// ─── Guarda en DB ─────────────────────────────────────────────────────────────

/**
 * Dev: Gabriel Paredes Sipe
 * Date modification: 30/03/2026
 * Funcionalidad: Crea en la BD la Ubicacion, la Publicacion vinculada al usuario,
 * las Imagenes y opcionalmente el Video 
 * de Publicacion por compatibilidad con campos no mapeados en Prisma.
 * @param {CaracteristicasInput} data  - Datos validados del paso 2
 * @param {object}               paso1 - Datos del paso 1 incluyendo id_usuario
 * @return {ActionResult} Resultado con idPublicacion generado o errores
 */
async function guardarPublicacionCompleta(
  data: CaracteristicasInput,
  paso1: {
    titulo:            string;
    precio:            number;
    descripcion:       string;
    id_tipo_inmueble:  number | null;
    id_tipo_operacion: number | null;
    videoUrl:          string | null;
    id_usuario:        string;
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

  // === HU5: Bandera para saber si debemos hacer Rollback en caso de error ===
  let bolCupoDescontado = false;

  try {
    // =========================================================================
    // HU5: BARRERA ATÓMICA DE SEGURIDAD (SQL Nativo para evitar Race Conditions)
    // =========================================================================
    if (paso1.id_usuario && paso1.id_usuario.trim() !== '') {
      
      // 1. Inicialización segura si es la primera publicación
      await prisma.$executeRaw`
        UPDATE "Usuario" 
        SET cant_publicaciones_restantes = 2 
        WHERE id_usuario = ${paso1.id_usuario}::uuid AND cant_publicaciones_restantes IS NULL;
      `;

      // 2. Descuento atómico inquebrantable
      const intFilasActualizadas = await prisma.$executeRaw`
        UPDATE "Usuario"
        SET cant_publicaciones_restantes = cant_publicaciones_restantes - 1
        WHERE id_usuario = ${paso1.id_usuario}::uuid AND cant_publicaciones_restantes > 0;
      `;

      // 3. Muralla: Si no se actualizó, es porque no hay cupo
      if (intFilasActualizadas === 0) {
        return { success: false, errors: {}, reason: "LIMITE_ALCANZADO" };
      }
      
      bolCupoDescontado = true; // Confirmamos que le quitamos el cupo
    }
    // =========================================================================

    // 1. Obtener próximo id_ubicacion (Código original de Gabriel)
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
        id_ciudad: idCiudad,
      },
    })

    // Crear Publicacion vinculada al usuario autenticado
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
        ${nextIdUbicacion},
        ${paso1.id_usuario}::uuid
      )
      RETURNING id_publicacion
    `
    const idPublicacion = resultado[0].id_publicacion

    // Crear Imagenes
    for (const url of imagenesUrl) {
      await prisma.$executeRaw`
        INSERT INTO "Imagen" (id_publicacion, url_imagen)
        VALUES (${idPublicacion}, ${url})
      `
    }

    // Guardar URL del video si fue proporcionada — Historia 3
    if (paso1.videoUrl) {
      await prisma.$executeRaw`
        INSERT INTO "Video" (id_publicacion, url_video)
        VALUES (${idPublicacion}, ${paso1.videoUrl})
      `
    }

    return { success: true, idPublicacion: resultado[0].id_publicacion }

  } catch (err) {
    console.error('[guardarPublicacionCompleta] Error en DB:', err)

    // =========================================================================
    // HU5: ROLLBACK DE SEGURIDAD
    // Si Gabriel's queries fallaron, le devolvemos su cupo al usuario.
    // =========================================================================
    if (bolCupoDescontado && paso1.id_usuario) {
      try {
        await prisma.$executeRaw`
          UPDATE "Usuario"
          SET cant_publicaciones_restantes = cant_publicaciones_restantes + 1
          WHERE id_usuario = ${paso1.id_usuario}::uuid;
        `;
      } catch (rollbackErr) {
        console.error('[HU5 Rollback] Error al devolver cupo:', rollbackErr);
      }
    }
    // =========================================================================

    return {
      success: false,
      errors:  { general: ['Error al guardar la publicación. Intenta de nuevo.'] },
    }
  }
}

/**
 * Dev: Gabriel Paredes Sipe
 * Date modification: 30/03/2026
 * Funcionalidad: Exportada para compatibilidad con llamadas anteriores.
 * Llama a guardarPublicacionCompleta con valores vacíos del paso 1.
 * @param {CaracteristicasInput} data - Datos validados del paso 2
 * @return {ActionResult} Resultado de la operación
 */
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
    id_usuario:        '',
  })
}